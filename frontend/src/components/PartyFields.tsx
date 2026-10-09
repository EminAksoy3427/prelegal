import { PartyInfo } from "@/lib/nda/types";

interface PartyFieldsProps {
  label: string;
  party: PartyInfo;
  onChange: (party: PartyInfo) => void;
}

export default function PartyFields({ label, party, onChange }: PartyFieldsProps) {
  const update = (field: keyof PartyInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => onChange({ ...party, [field]: e.target.value });

  const idPrefix = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold text-sm text-gray-900">{label}</legend>
      <div>
        <label
          htmlFor={`${idPrefix}-name`}
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={party.name}
          onChange={update("name")}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-title`}
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={party.title}
          onChange={update("title")}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-company`}
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Company
        </label>
        <input
          id={`${idPrefix}-company`}
          type="text"
          value={party.company}
          onChange={update("company")}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-notice-address`}
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Notice Address (email or postal)
        </label>
        <input
          id={`${idPrefix}-notice-address`}
          type="text"
          value={party.noticeAddress}
          onChange={update("noticeAddress")}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
    </fieldset>
  );
}
