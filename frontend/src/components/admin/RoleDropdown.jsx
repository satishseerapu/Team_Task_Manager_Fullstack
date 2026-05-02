import Select from '../ui/Select';

const ROLE_OPTIONS = [
  { value: 'Member', label: 'Member' },
  { value: 'Admin', label: 'Admin' },
];

export default function RoleDropdown({ value, onChange, disabled, className }) {
  return (
    <Select
      id="role"
      options={ROLE_OPTIONS}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    />
  );
}
