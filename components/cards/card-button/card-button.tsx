
// TODO: Use this component in the index card form. Currently commented out to avoid lint errors.

// import styles from './card-button.module.scss';
// interface Props {
//   term: string;
//   definition: string;
//   cardEditMode: boolean;
//   handleAddIndexCard: any;
//   handleUpdateIndexCard: () => void;
// }

// const CardButton: React.FC<Props> = ({
//   term,
//   definition,
//   cardEditMode,
//   handleAddIndexCard,
//   handleUpdateIndexCard,
// }) => {
//   return (
//     <button
//       disabled={!definition}
//       className={styles.save_card}
//       onClick={
//         !cardEditMode
//           ? () => handleAddIndexCard(term, definition)
//           : handleUpdateIndexCard
//       }
//     >
//       Save
//     </button>
//   );
// };

// export default CardButton;
