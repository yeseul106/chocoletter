package chocolate.chocoletter.api.giftbox.controller;

import chocolate.chocoletter.api.giftbox.dto.request.GeneralFreeGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.GeneralQuestionRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.SpecialFreeGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.request.SpecialQuestionGiftRequestDto;
import chocolate.chocoletter.api.giftbox.dto.response.GiftCountResponseDto;
import chocolate.chocoletter.api.giftbox.service.GiftBoxService;
import chocolate.chocoletter.common.util.JwtTokenUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gift-box")
@RequiredArgsConstructor
public class GiftBoxController implements GiftBoxSwagger {
    private final GiftBoxService giftBoxService;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/{giftBoxId}/gift/general/free")
    public ResponseEntity<?> sendGeneralFreeGift(@PathVariable("giftBoxId") Long giftBoxId, @Valid @RequestBody
    GeneralFreeGiftRequestDto requestDto) {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        giftBoxService.sendGeneralFreeGift(memberId, giftBoxId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{giftBoxId}/gift/general/question")
    public ResponseEntity<?> sendGeneralQuestionGift(@PathVariable("giftBoxId") Long giftBoxId, @Valid @RequestBody
    GeneralQuestionRequestDto requestDto) {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        giftBoxService.sendGeneralQuestionGift(memberId, giftBoxId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{giftBoxId}/gift/special/free")
    public ResponseEntity<?> sendSpecialFreeGift(@PathVariable("giftBoxId") Long giftBoxId, @Valid @RequestBody
    SpecialFreeGiftRequestDto requestDto) {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        giftBoxService.sendSpecialFreeGift(memberId, giftBoxId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{giftBoxId}/gift/special/question")
    public ResponseEntity<?> sendSpecialQuestionGift(@PathVariable("giftBoxId") Long giftBoxId, @Valid @RequestBody
    SpecialQuestionGiftRequestDto requestDto) {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        giftBoxService.sendSpecialQuestionGift(memberId, giftBoxId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/count")
    public ResponseEntity<?> findGiftCount() {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        GiftCountResponseDto responseDto = giftBoxService.findGiftCount(memberId);
        return ResponseEntity.ok(responseDto);
    }

    @PatchMapping("/preview")
    public ResponseEntity<?> usePreviewCount() {
        // 로그인 한 유저 찾아오기
        Long memberId = 1L;
        giftBoxService.usePreviewCount(memberId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{giftBoxId}")
    public ResponseEntity<?> findGiftBox(@PathVariable("giftBoxId") Long giftBoxId) {
        return ResponseEntity.ok(giftBoxService.findFriendGiftBox(giftBoxId));
    }

    @GetMapping("/{giftBoxId}/unboxing/schedule")
    public ResponseEntity<?> findUnboxingTimes(@PathVariable("giftBoxId") Long giftBoxId) {
        return ResponseEntity.ok(giftBoxService.findUnBoxingTimes(giftBoxId));
    }

    @GetMapping("/link")
    public ResponseEntity<?> getShareCode(@RequestHeader("Authorization") String token) {
        // "Bearer " 제거하기
        String jwtToken = token.substring(7);
        Long memberId = jwtTokenUtil.getIdFromToken(jwtToken);

        return ResponseEntity.ok(giftBoxService.findShareCodeByMemberId(memberId));
    }
}
