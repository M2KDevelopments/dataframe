import { ArrowDown01, Edit2, GripVertical, KeyRound, Sparkle, Trash2 } from 'lucide-react';
import { ActionIcon, Input, Tooltip, Checkbox, Chip } from '@mantine/core';
import FIELD_TYPES from '../assets/fieldtypes.json';

const mapFieldTypes = new Map();
for (const f of FIELD_TYPES) mapFieldTypes.set(f.value, f.label);

function DataField({ table, field, fieldindex, onEditField, onRemoveField }) {
    return (
        <div className="flex gap-2 items-center bg-gray-50 p-2 border-2 border-gray-200 rounded-2xl">
            <div className="cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2  items-center">
                    <Checkbox color="teal" />
                    <Input style={{ width: "100%", fontWeight: "bold" }} radius="lg" size="xs" placeholder='Field Name' value={field.name} />

                    <Tooltip label="Edit field">
                        <ActionIcon onClick={onEditField} size="xs" variant='outline' color='gray'>
                            <Edit2 size={12} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove field">
                        <ActionIcon onClick={() => onRemoveField(table.index, fieldindex)} size="xs" variant='outline' color='gray'>
                            <Trash2 size={12} />
                        </ActionIcon>
                    </Tooltip>
                </div>

                <div className="flex gap-2 items-center">

                    <Chip size="xs" icon={null} checked={true} variant="outline" color="teal">{mapFieldTypes.get(field.type)}</Chip>
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
                    <Chip size="xs" disabled={true} defaultChecked icon={null}>Min: {field.min || " ?"}</Chip>
                    <Chip size="xs" disabled={true} defaultChecked icon={null}>Max: {field.max || " ?"}</Chip>
                </div>
            </div>
        </div>
    )
}

export default DataField