package chocolate.chocoletter.api.gift.repository;

import chocolate.chocoletter.api.gift.domain.Gift;
import chocolate.chocoletter.api.gift.domain.GiftType;
import chocolate.chocoletter.common.exception.ErrorMessage;
import chocolate.chocoletter.common.exception.NotFoundException;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GiftRepository extends JpaRepository<Gift, Long> {

    @Query("select g from Gift g where g.receiverId = :receiverId")
    List<Gift> findAllGift(@Param("receiverId") Long receiverId);

    @Query("select g from Gift g where g.receiverId = :receiverId and g.type = :giftType")
    List<Gift> findSpecificGift(@Param("receiverId") Long receiverId, @Param("giftType") GiftType giftType);

    @Query("select g from Gift g where g.id = :giftId")
    Gift findGiftById(@Param("giftId") Long giftId);

    @Query("select g from Gift g where g.type = :giftType and (g.receiverId = :memberId or g.senderId = :memberId)")
    List<Gift> findAllSpecialGifts(@Param("memberId") Long memberId, @Param("giftType") GiftType giftType);

    @Query("select g from Gift g where g.senderId = :senderId and g.giftBox.id = :giftBoxId")
    Gift findGiftBySenderIdAndGiftBoxId(Long senderId, Long giftBoxId);

    @Query("select g from Gift g where g.senderId = :senderId and g.receiverId = :receiverId and g.type = :giftType")
    Gift findGeneralGiftBySenderIdAndReceiverId(Long senderId, Long receiverId, GiftType giftType);

    @Query("select g.id, g.unBoxingTime from Gift g where g.id in :giftIds")
    List<Object[]> findUnBoxingTimesByGiftIds(@Param("giftIds") List<Long> giftIds);

    @Query("select g.id, g.status from Gift g where g.id in :giftIds")
    List<Object[]> findGiftStatusesByGiftIds(Iterable<Long> giftIds);

    default Gift findGiftByIdOrThrow(Long giftId) {
        return findById(giftId)
                .orElseThrow(() -> new NotFoundException(ErrorMessage.ERR_NOT_FOUND_GIFT));
    }

}
