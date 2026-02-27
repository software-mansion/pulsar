import style from './NoResult.module.scss';

interface Props {}

export function NoResult({}: Props) {
  return (
    <div className={style.noResult}>
      <div className={style.header}>
        <div className={style.name}>No results?</div>
        <div className={style.description}>
          Try adjusting your filters or{' '}
          <a className={style.descriptionLink}>request for a Pulsar Studio</a>.
        </div>
      </div>
    </div>
  );
}
