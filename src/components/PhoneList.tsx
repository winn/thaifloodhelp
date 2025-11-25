import { formatPhoneNumber, getPhoneLink } from "@/lib/utils";

interface PhoneListProps {
  phones: string[];
  className?: string;
}

export const PhoneList = ({ phones, className = "" }: PhoneListProps) => {
  if (!phones || phones.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {phones.map((phone, idx) => (
        <a
          key={idx}
          href={`tel:${getPhoneLink(phone)}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {formatPhoneNumber(phone)}
        </a>
      ))}
    </div>
  );
};
