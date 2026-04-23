import { BASE_PATH } from '../../../../config';
import { articles } from '../../../data/articles';
import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './Articles.module.scss';

export function Articles({ className }: { className?: string }) {
  return (
    <ArticlesGrid
      className={className}
      showHeader
      showBrowseAllButton
    />
  );
}

type ArticlesGridProps = {
  className?: string;
  showBrowseAllButton?: boolean;
  showHeader?: boolean;
  showLoadMore?: boolean;
};

export function ArticlesGrid({
  className,
  showBrowseAllButton = false,
  showHeader = false,
}: ArticlesGridProps) {
  return (
    <div className={`${styles.section} not-content ${className || ''}`}>
      {showHeader ? (
        <div className={styles.left}>
          <SectionHeader
            title="Articles"
            subtitle="Learn how haptics work, why they matter, and how to design tactile experiences that feel right."
            align="left"
          />
        </div>
      ) : null}
      <div className={styles.right}>
        {articles.map((article) => (
          <ArticleCard key={article.url} {...article} />
        ))}
      </div>
      {showBrowseAllButton ? (
        <Button
          label="Browse all articles"
          url={`${BASE_PATH}/articles/`}
          className={styles.footerButton}
        />
      ) : null}
    </div>
  );
}

function ArticleCard({
  imageAlt,
  imageUrl,
  publishedAt,
  title,
  url,
}: {
  imageAlt?: string;
  imageUrl?: string;
  publishedAt?: string;
  title: string;
  url: string;
}) {
  return (
    <a className={styles.card} href={url} target="_blank" rel="noreferrer">
      {imageUrl ? (
        <div className={styles.imageWrap}>
          <img className={styles.image} src={imageUrl} alt={imageAlt || title} loading="lazy" />
        </div>
      ) : null}
      {publishedAt ? <div className={styles.meta}>{publishedAt}</div> : null}
      <div className={styles.title}>{title}</div>
      <div className={styles.cta}>Read article</div>
    </a>
  );
}
