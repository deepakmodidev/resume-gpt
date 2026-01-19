import React from "react";
import { CoverLetterData } from "@/lib/types";
import { coverLetterStyles } from "@/lib/constants/cover-letter-styles";

interface CoverLetterContentProps {
  data: CoverLetterData;
  template?: string;
}

export const CoverLetterContent = ({
  data,
  template = "modern",
}: CoverLetterContentProps) => {
  const styles =
    coverLetterStyles[template as keyof typeof coverLetterStyles] ||
    coverLetterStyles.modern;

  return (
    <div
      className={`template-${template} ${styles.container} print:shadow-none`}
    >
      {/* Header - Sender Info */}
      <div className={styles.header}>
        {data.senderName && (
          <h1 className={styles.senderName}>{data.senderName}</h1>
        )}
        <div className={styles.senderInfo}>
          {data.senderEmail && <span>{data.senderEmail}</span>}
          {data.senderPhone && <span> • {data.senderPhone}</span>}
          {data.senderAddress && (
            <div className="mt-1">{data.senderAddress}</div>
          )}
        </div>
        {data.date && <div className={styles.date}>{data.date}</div>}
      </div>

      {/* Recipient Section */}
      <div className={styles.recipientSection}>
        {data.recipientName && (
          <div className={styles.recipientName}>{data.recipientName}</div>
        )}
        {data.recipientTitle && (
          <div className={styles.recipientInfo}>{data.recipientTitle}</div>
        )}
        {data.companyName && (
          <div className={styles.recipientInfo}>{data.companyName}</div>
        )}
        {data.companyAddress && (
          <div className={styles.recipientInfo}>{data.companyAddress}</div>
        )}
      </div>

      {/* Greeting */}
      {data.greeting && <div className={styles.greeting}>{data.greeting}</div>}

      {/* Body Content */}
      {data.opening && <p className={styles.bodyParagraph}>{data.opening}</p>}
      {data.body && (
        <p className={styles.bodyParagraph} style={{ whiteSpace: "pre-line" }}>
          {data.body}
        </p>
      )}

      {/* Closing */}
      {data.closing && <div className={styles.closing}>{data.closing}</div>}

      {/* Signature */}
      {data.signature && (
        <div className={styles.signature}>{data.signature}</div>
      )}
    </div>
  );
};
