import { useState, useEffect } from 'react';
import Select from '../ui/Select';
import userService from '../../services/userService';

export default function AddMemberForm({ projectId, existingMemberIds = [], onAdd, loading }) {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    userService.getOrgMembers().then((d) => setMembers(d.users ?? d)).catch(() => {});
  }, []);

  const available = members.filter((m) => !existingMemberIds.includes(m._id));

  const options = [
    { value: '', label: 'Select a member…' },
    ...available.map((m) => ({ value: m._id, label: `${m.name} (${m.email})` })),
  ];

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedId) return;
    onAdd(selectedId);
    setSelectedId('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <Select
        label="Add member"
        id="add-member"
        options={options}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1"
      />
      <button
        type="submit"
        className="btn-primary mb-0"
        disabled={!selectedId || loading}
      >
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
