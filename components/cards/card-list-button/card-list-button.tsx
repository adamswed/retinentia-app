import Image from 'next/image';
import cardList from '@/assets/card-list.svg';
import cardListMobile from '@/assets/card-list-mobile.svg';
import addCard from '@/assets/add-card.svg';
import addCardMobile from '@/assets/add-card-mobile.svg';
import style from './card-list-button.module.scss';

type Props = {
  indexCardListMode: boolean;
  indexCardsLength: number | undefined;
  showCardList: () => void;
};

const CardListButton: React.FC<Props> = ({
  indexCardListMode,
  indexCardsLength,
  showCardList,
}) => {
  return (
    <>
      {(indexCardsLength ?? 0) > 0 && (
        <div className={style.card_icon_wrapper} onClick={() => showCardList()}>
          <div
            className={`${style.card_icon_container} ${
              !indexCardListMode ? style.active : style.inactive
            }`}
          >
            <Image
              className={style.card_list_icon}
              src={cardList}
              width={37}
              height={25.1}
              priority
              alt={'Index card list'}
            />
            <Image
              className={style.card_list_mobile_icon}
              src={cardListMobile}
              width={28.45}
              height={20.07}
              priority
              alt={'Index card list'}
            />
            <figcaption className={style.card_list_caption}>
              Library
            </figcaption>
          </div>
          <div
            className={`${style.card_icon_container} ${
              indexCardListMode ? style.active : style.inactive
            }`}
          >
            <Image
              className={style.add_card_icon}
              width={37.61}
              height={25.16}
              src={addCard}
              alt={'Add a new index card'}
            />
            <Image
              className={style.add_card_mobile_icon}
              width={31.2}
              height={20.13}
              src={addCardMobile}
              alt={'Add a new index card'}
            />
            <figcaption className={style.card_list_caption}>New</figcaption>
          </div>
        </div>
      )}
    </>
  );
};

export default CardListButton;
