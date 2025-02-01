package chocolate.chocoletter.api.giftbox.service;

import chocolate.chocoletter.api.chatroom.service.ChatRoomService;
import chocolate.chocoletter.api.gift.domain.Gift;
import chocolate.chocoletter.api.gift.service.GiftService;
import chocolate.chocoletter.api.giftbox.domain.GiftBox;
import chocolate.chocoletter.api.giftbox.dto.request.GeneralFreeGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.GeneralQuestionRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.SpecialFreeGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.SpecialQuestionGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.response.GiftBoxResponseDto;
import chocolate.chocoletter.api.giftbox.dto.response.GiftBoxShareCodeResponseDto;
import chocolate.chocoletter.api.giftbox.dto.response.GiftCountResponseDto;
import chocolate.chocoletter.api.giftbox.dto.response.UnboxingTimesResponseDto;
import chocolate.chocoletter.api.giftbox.repository.GiftBoxRepository;
import chocolate.chocoletter.api.letter.domain.Letter;
import chocolate.chocoletter.api.letter.service.LetterService;
import chocolate.chocoletter.api.member.domain.Member;
import chocolate.chocoletter.api.member.repository.MemberRepository;
import chocolate.chocoletter.common.exception.BadRequestException;
import chocolate.chocoletter.common.exception.ErrorMessage;
import chocolate.chocoletter.common.exception.NotFoundException;
import chocolate.chocoletter.common.util.DateTimeUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GiftBoxService {
    private final MemberRepository memberRepository;
    private final GiftBoxRepository giftBoxRepository;
    private final GiftService giftService;
    private final LetterService letterService;
    private final ChatRoomService chatRoomService;
    private final DateTimeUtil dateTimeUtil;

    @Transactional
    public void sendGeneralFreeGift(Long senderId, Long giftBoxId, GeneralFreeGiftRequestDto requestDto) {
        Gift gift = generateGeneralGift(senderId, giftBoxId);
        Letter letter = Letter.createGeneralLetter(gift, requestDto.nickName(), requestDto.content());
        letterService.saveLetter(letter);

        Optional<Member> member = memberRepository.findById(senderId);
        Member sendMember = member.get();
        sendMember.increaseSendGiftCount();
    }

    @Transactional
    public void sendGeneralQuestionGift(Long senderId, Long giftBoxId, GeneralQuestionRequestDto requestDto) {
        Gift gift = generateGeneralGift(senderId, giftBoxId);
        Letter letter = Letter.createQuestionLetter(gift, requestDto.nickName(), requestDto.question(),
                requestDto.answer());
        letterService.saveLetter(letter);

        Optional<Member> member = memberRepository.findById(senderId);
        Member sendMember = member.get();
        sendMember.increaseSendGiftCount();
    }

    @Transactional
    public void sendSpecialFreeGift(Long senderId, Long giftBoxId, SpecialFreeGiftRequestDto requestDto) {
        Gift gift = generateSpecialGift(senderId, giftBoxId, requestDto.unBoxingTime());
        Letter letter = Letter.createGeneralLetter(gift, requestDto.nickName(), requestDto.content());
        letterService.saveLetter(letter);

        Optional<Member> member = memberRepository.findById(senderId);
        Member sendMember = member.get();
        sendMember.increaseSendGiftCount();
    }

    @Transactional
    public void sendSpecialQuestionGift(Long senderId, Long giftBoxId, SpecialQuestionGiftRequestDto requestDto) {
        Gift gift = generateSpecialGift(senderId, giftBoxId, requestDto.unBoxingTime());
        Letter letter = Letter.createQuestionLetter(gift, requestDto.nickName(), requestDto.question(),
                requestDto.answer());
        letterService.saveLetter(letter);

        Optional<Member> member = memberRepository.findById(senderId);
        Member sendMember = member.get();
        sendMember.increaseSendGiftCount();
    }

    public GiftCountResponseDto findGiftCount(Long memberId) {
        GiftBox giftBox = giftBoxRepository.findGiftBoxByMemberId(memberId);
        return GiftCountResponseDto.of(giftBox);
    }

    public GiftBoxResponseDto findFriendGiftBox(Long giftBoxId) {
        GiftBox friendGiftBox = findGiftBox(giftBoxId);
        return GiftBoxResponseDto.of(friendGiftBox);
    }

    public UnboxingTimesResponseDto findUnBoxingTimes(Long giftBoxId) {
        return UnboxingTimesResponseDto.of(
                giftService.findReceiverUnboxingTimes(findGiftBox(giftBoxId).getMember().getId()));
    }

    @Transactional
    public void usePreviewCount(Long memberId) {
        GiftBox myGiftBox = giftBoxRepository.findGiftBoxByMemberId(memberId);
        if (myGiftBox.getGeneralGiftCount() < 2) {
            throw new BadRequestException(ErrorMessage.ERR_NOT_ENOUGH_PREVIEW_GIFT_COUNT);
        }
        myGiftBox.usePreviewCount();
    }

    @Transactional
    public Gift generateGeneralGift(Long senderId, Long giftBoxId) {
        checkGiftExists(senderId, giftBoxId);
        GiftBox receiverGiftBox = findGiftBox(giftBoxId);
        Gift gift = Gift.createGeneralGift(receiverGiftBox, senderId, receiverGiftBox.getMember().getId());
        giftService.saveGift(gift);
        makeChattingRoom(gift.getReceiverId(), gift.getSenderId(), gift.getId());
        receiverGiftBox.addGiftCount();
        receiverGiftBox.addGeneralGiftCount();
        return gift;
    }

    @Transactional
    public Gift generateSpecialGift(Long senderId, Long giftBoxId, String unBoxingTime) {
        checkGiftExists(senderId, giftBoxId);
        GiftBox receiverGiftBox = findGiftBox(giftBoxId);
        Gift gift = Gift.createSpecialGift(receiverGiftBox, senderId, receiverGiftBox.getMember().getId(),
                dateTimeUtil.parseTimeToDateTime(unBoxingTime));
        giftService.saveGift(gift);
        receiverGiftBox.addGiftCount();
        return gift;
    }

    public GiftBoxShareCodeResponseDto findShareCodeByMemberId(Long memberId) {
        return GiftBoxShareCodeResponseDto.of(giftBoxRepository.findByMemberId(memberId));
    }

    private GiftBox findGiftBox(Long giftBoxId) {
        GiftBox receiverGiftBox = giftBoxRepository.findGiftBoxByGiftBoxId(giftBoxId);
        if (receiverGiftBox == null) {
            throw new NotFoundException(ErrorMessage.ERR_NOT_FOUND_GIFT_BOX);
        }
        return receiverGiftBox;
    }

    private void checkGiftExists(Long senderId, Long giftBoxId) {
        if (giftService.findMyGift(senderId, giftBoxId)) {
            throw new BadRequestException(ErrorMessage.ERR_ALREADY_EXISTS_GIFT);
        }
    }

    @Transactional
    public void makeChattingRoom(Long senderId, Long receiverId, Long senderGiftId) {
        Gift receiverGift = giftService.findGeneralGiftEachOther(senderId, receiverId);
        if (receiverGift != null) {
            chatRoomService.saveChatRoom(senderId, receiverId, senderGiftId, receiverGift.getId());
        }
    }
}
