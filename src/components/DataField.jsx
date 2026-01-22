import { ArrowDown01, Edit2, GripVertical, KeyRound, Sparkle, Trash2 } from 'lucide-react';
import { ActionIcon, Input, Tooltip, Checkbox, Chip } from '@mantine/core';
import FIELD_TYPES from '../assets/fieldtypes.json';
import { useSortable } from '@dnd-kit/sortable';

const mapFieldTypes = new Map();
for (const f of FIELD_TYPES) mapFieldTypes.set(f.value, f.label);


function DataField({ dragId, isTimestamp, dragOverlay, table, field, fieldindex, onEditField, onRemoveField, onSelectedField, selectedFieldsSet }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId });

    return (
        <div
            ref={dragOverlay || isTimestamp ? null : setNodeRef}
            style={{
                transform: transform ? `translateY(${transform.y}px)` : undefined,
                transition,
                zIndex: dragOverlay ? 999 : undefined,
                opacity: isDragging && !dragOverlay ? 0.5 : 1,
            }}
            className={`hover:shadow-md transition-shadow cursor-pointer relative ${isDragging ? 'ring-2 ring-indigo-200 border border-gray-200' : ''}`}

        >
            <div className="flex gap-2 items-center bg-gray-50 p-2 border-2 border-gray-200 rounded-2xl">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2  items-center">
                        <Checkbox disabled={isTimestamp} color="teal" className='field-checkbox' checked={selectedFieldsSet.has(`${table.index}-${fieldindex}`)} onChange={(e) => onSelectedField(table.index, fieldindex, e.target.checked)} />
                        <Input style={{ width: "100%", fontWeight: "bold" }} radius="lg" size="xs" placeholder='Field Name' value={field.name} onChange={() => null} />

                        <Tooltip label="Edit field">
                            <ActionIcon disabled={isTimestamp} onClick={onEditField} size="xs" variant='outline' color='gray'>
                                <Edit2 size={12} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Remove field">
                            <ActionIcon disabled={isTimestamp} onClick={() => onRemoveField(table.index, fieldindex)} size="xs" variant='outline' color='gray'>
                                <Trash2 size={12} />
                            </ActionIcon>
                        </Tooltip>
                    </div>

                    <div className="flex gap-2 items-center">

                        <Chip size="xs" icon={null} checked={true} variant="outline" color="teal">{isTimestamp ? "Timestamp" : mapFieldTypes.get(field.type)}</Chip>
                        <Tooltip label="Primary Key">
                            <ActionIcon disabled={!field.primarykey || field.type == 'boolean'} variant={'outline'} size="sm" color='orange' radius="lg">
                                <KeyRound size={12} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Foreign Key">
                            <ActionIcon disabled={!field.foreignkey || field.type == 'boolean'} variant={'outline'} size="sm" color='indigo' radius="lg">
                                <KeyRound size={12} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Field should be unique">
                            <ActionIcon disabled={!field.unique || field.type == 'boolean'} variant={'outline'} size="sm" color='grape' radius="lg">
                                <Sparkle size={12} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Auto Increment">
                            <ActionIcon disabled={!field.autoincrement || field.type == 'boolean'} variant={'outline'} size="sm" color='pink' radius="lg">
                                <ArrowDown01 size={12} />
                            </ActionIcon>
                        </Tooltip>
                        {isTimestamp ? null : <Chip size="xs" disabled={true} defaultChecked icon={null}>Min: {field.min || " ?"}</Chip>}
                        {isTimestamp ? null : <Chip size="xs" disabled={true} defaultChecked icon={null}>Max: {field.max || " ?"}</Chip>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataField