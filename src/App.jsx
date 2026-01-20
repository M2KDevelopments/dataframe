import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown01, Clock, Edit2, GripVertical, KeyRound, Maximize2Icon, Minimize2Icon, Plus, RefreshCw, SearchIcon, Sparkle, Table, Trash2, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import swal from 'sweetalert';
import { MdCheck, MdWarning } from 'react-icons/md';
import { MantineProvider, Drawer, Button, ActionIcon, Input, Accordion, Group, Tooltip, Select, NumberInput, Divider, Checkbox, Chip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Drawflow from 'drawflow'
import 'drawflow/dist/drawflow.min.css';
import './drawflow.css';

const FIELD_TYPES = [
  { label: "Text", value: "text" },
  { label: "Number", value: "int" },
  { label: "Decimal", value: "float" },
  { label: "Yes/No", value: "boolean" }
]

const DEFAULT_FIELD = {
  name: "",
  type: FIELD_TYPES[0].value,
  unique: false,
  primarykey: false,
  autoincrement: false,
  foriegnkey: "",
  min: "",
  max: "",
}

function App() {

  const [projectName, setProjectName] = useState(window.localStorage.getItem('project') || "New Project")
  const [opened, { open, close }] = useDisclosure(false);
  const [tables, setTables] = useState([]);//[{name:string, timestamp:false, fields:[ {name, type} ]}]
  const [tablename, setTablename] = useState('')
  const [tablefield, setTableField] = useState(DEFAULT_FIELD)


  const [search, setSearch] = useState('');
  const filteredTables = useMemo(() => tables
    .map((t, idx) => ({ ...t, index: idx }))
    .filter((table) => !search.trim() || table.name.toLowerCase().includes(search.toLowerCase())),
    [tables, search])

  const [editor, setEditor] = useState(null);

  useEffect(() => {
    // Load Drawflow
    if (!document.querySelector('.drawflow')) {
      var id = document.getElementById("drawflow");
      const editor = new Drawflow(id);
      editor.reroute = true;
      editor.start();
      setEditor(editor);
    }
  }, [])


  const getNodeHTML = useCallback((table) => `
          <div title="${table.name}" aria-label="Table" class="p-2 rounded-lg w-96">
            <div class="flex flex-col gap-3">
              <div class="flex gap-2">
                <span class="font-bold text-md">${table.name}</span>
              </div>
              <div class="flex gap-2 my-2">
                ${table.weather ? `<span class="border-2 border-orange-500 shadow shadow-orange-300 rounded-4xl px-3 py-2 text-xs">${table.weather}</span>` : ""}
                ${table.atmosphere ? `<span class="border-2 border-green-500 shadow shadow-green-300 rounded-4xl px-3 py-2 text-xs">${table.atmosphere}</span>` : ""}
                ${table.dateTime ? `<span class="border-2 border-purple-500 shadow shadow-purple-300 rounded-4xl px-3 py-2 text-xs">${table.dateTime}</span>` : ""}
                ${table.area ? `<span class="border-2 border-red-500 shadow shadow-red-300 rounded-4xl px-3 py-2 text-xs">${table.area}</span>` : ""}
              </div>
              <span class="text-sm">${"Your fields go here"}</span>
            </div>
          </div>
          `, [])

  const onAddTable = useCallback((name) => {
    if (!name || !name.trim()) return;

    if (name.includes(" ")) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "No whitesplaces in table name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "Please enter a valid table name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    if (tables.some(t => t.name == name)) return;

    const table = { name, timestamp: false, fields: [] }
    const inputs = 1;
    const outputs = 1;
    const posx = 90;
    const posy = 90;
    const className = '';
    const html = getNodeHTML(table);
    editor.addNode(name, inputs, outputs, posx, posy, className, table, html);
    setTables(prev => [...prev, table].sort((a, b) => a.name.localeCompare(b.name)));
    setTablename('');

    //refocus on field
    const input = document.getElementById('tablefield');
    if(input) input.focus();

    return notifications.show({ title: "Table Added", message: `${name} was added successfully`, color: "green", icon: <MdCheck /> })
  }, [editor, getNodeHTML, tables])


  const onTableTimestamp = useCallback(async (index) => {
    tables[index].timestamp = !tables[index].timestamp;
    setTables([...tables]);
  }, [tables]);


  const onRenameTable = useCallback(async (index) => {
    const table = tables[index];
    const name = await swal({
      title: `Rename ${table.name}`,
      text: `Enter the name of the table`,
      icon: "info",
      buttons: ['Cancel', 'Rename'],
      content: {
        element: "input",
        attributes: {
          value: table.name,
          placeholder: "Table Name...",

        }
      }
    })

    if (!name) return;


    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "Please enter a valid table name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    if (tables.some(t => t.name == name)) {
      return notifications.show({
        title: "Table already exists",
        message: `${name} already exists in your list`,
        color: "orange",
        icon: <MdWarning />
      });
    }

    tables[index].name = name;
    setTables([...tables]);
  }, [tables]);


  const onRemoveTable = async (table) => {
    const result = await swal({
      title: `Remove ${table.name}`,
      text: `Are you sure you want remove Table '${table.name}'`,
      icon: "warning",
      buttons: ['Cancel', 'Remove']
    })

    if (!result) return;

    setTables(tables.filter(t => t.name != table.name));
  }

  const onAddField = useCallback(async (tableIndex, field) => {

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == field.name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "Please enter a valid field name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    if (field.name.includes(" ")) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "No whitesplaces in field name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    // check if it already exists
    if (tables[tableIndex].fields.some(f => f.name == field.name)) {
      return notifications.show({
        title: "Field already exists",
        message: `${field.name} already exists in the ${tables[tableIndex].name} Table`,
        color: "orange",
        icon: <MdWarning />
      });
    }

    // Check min and max are avlue
    if (field.min != '' && field.max != '') {
      if (isNaN(field.min)) {
        return notifications.show({
          title: "Invalid min value",
          message: `${field.name}'s max value should be a number`,
          color: "orange",
          icon: <MdWarning />
        });
      }

      if (isNaN(field.max)) {
        return notifications.show({
          title: "Invalid max value",
          message: `${field.name}'s max value should be a number`,
          color: "orange",
          icon: <MdWarning />
        });
      }
      const max = parseFloat(field.max);
      const min = parseFloat(field.min)
      if (max <= min) {
        return notifications.show({
          title: "Invalid max and min values",
          message: `${field.name}'s max value should be greater than the min value`,
          color: "orange",
          icon: <MdWarning />
        });
      }
    }

    tables[tableIndex].fields.push(field);
    setTables([...tables]);
    setTableField(DEFAULT_FIELD)

    //refocus on input
    const input = document.getElementById('fieldinput-' + tableIndex);
    if (input) input.focus();

    return notifications.show({ title: "Field Added", message: `${field.name} was added successfully`, color: "green", icon: <MdCheck /> })
  }, [tables])


  const onRemoveField = useCallback(async (tableIndex, fieldIndex) => {
    const field = tables[tableIndex].fields[fieldIndex];
    const result = await swal({
      title: `Remove ${field.name}`,
      text: `Are you sure you want remove Table '${field.name}'`,
      icon: "warning",
      buttons: ['Cancel', 'Remove']
    })

    if (!result) return;

    tables[tableIndex].fields = tables[tableIndex].fields.filter((f, i) => i != fieldIndex);
    setTables([...tables]);
  }, [tables])


  return (
    <MantineProvider>
      <Notifications />

      <div className='w-full h-full'>
        <NavBar projectName={projectName} setProjectName={setProjectName} openDrawer={open} />

        <Drawer opened={opened} onClose={close} title={
          <div className='grid grid-cols-2'>
            {/* Adding Table */}
            <Input id="tablefield" placeholder='Table Name' leftSection={<Table />} maxLength={100} value={tablename} onKeyDown={(e) => { if (e.key === 'Enter')  onAddTable(tablename)}} onChange={e => setTablename(e.target.value)} />
            <Button variant='filled' color='#104e64' leftSection={<Plus />} onClick={() => onAddTable(tablename)}>Add Table</Button>
          </div>
        }>
          <div className='flex flex-col gap-3 h-[90vh]'>

            {/* Search */}
            <Input.Wrapper label="Search">
              <Input placeholder='Search for Tables...' maxLength={100} leftSection={<SearchIcon />} radius={"md"} type='search' value={search} onChange={e => setSearch(e.target.value)} />
            </Input.Wrapper>

            {/* Tables */}
            <div className='flex flex-col gap-2 overflow-y-scroll min-h-4/5 bg-slate-50 p-2 rounded-2xl border-slate-100'>
              <Accordion chevronPosition="left" variant="contained" radius="md" defaultValue="">
                {filteredTables.map((table) =>
                  <Accordion.Item key={table.name} value={table.name}>
                    <Accordion.Control icon={
                      <Group>

                        <Tooltip label="Table should have Timestamp?">
                          <ActionIcon onClick={() => onTableTimestamp(table.index)} variant={table.timestamp ? 'filled' : 'outline'} color='teal' radius="lg">
                            <Clock size={14} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label={`Rename Table`}>
                          <ActionIcon onClick={() => onRenameTable(table.index)} variant="outline" radius="sm" color="dark">
                            <Edit2 size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label={`Remove ${table.name}`}>
                          <ActionIcon onClick={() => onRemoveTable(table)} variant="outline" radius="sm" color="dark">
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>


                      </Group>
                    }>
                      <Group>
                        <Table color="teal" size={16} />
                        {table.name}
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className="flex gap-2 items-center">
                        {/* <div className="cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div> */}
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex gap-2  items-center">
                            {/* <Checkbox /> */}
                            <Input onKeyDown={(e) => { if (e.key === 'Enter') onAddField(table.index, tablefield) }} id={'fieldinput-' + table.index} placeholder='Field Name' value={tablefield.name} onChange={e => setTableField({ ...tablefield, name: e.target.value })} />
                            <Select placeholder="Data Type" value={tablefield.type} onChange={(fieldtype) => setTableField({ ...tablefield, type: fieldtype })} data={FIELD_TYPES} />
                            <ActionIcon onClick={() => onAddField(table.index, tablefield)} variant='filled' color='#104e64'><Plus /></ActionIcon>
                          </div>


                          <div className="flex gap-2 items-center">

                            <Tooltip label="Primary Key">
                              <ActionIcon onClick={() => setTableField({ ...tablefield, primarykey: !tablefield.primarykey })} disabled={tablefield.type == 'boolean'} variant={tablefield.primarykey ? 'filled' : 'outline'} size="sm" color='orange' radius="lg">
                                <KeyRound size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Foreign Key">
                              <ActionIcon onClick={() => null} disabled={tablefield.type == 'boolean'} variant={tablefield.foriegnkey ? 'filled' : 'outline'} size="sm" color='indigo' radius="lg">
                                <KeyRound size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Field should be unique">
                              <ActionIcon onClick={() => setTableField({ ...tablefield, unique: !tablefield.unique })} disabled={tablefield.type == 'boolean'} variant={tablefield.unique ? 'filled' : 'outline'} size="sm" color='grape' radius="lg">
                                <Sparkle size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Auto Increment">
                              <ActionIcon onClick={() => setTableField({ ...tablefield, autoincrement: !tablefield.autoincrement })} disabled={tablefield.type == 'boolean'} variant={tablefield.autoincrement ? 'filled' : 'outline'} size="sm" color='pink' radius="lg">
                                <ArrowDown01 size={12} />
                              </ActionIcon>
                            </Tooltip>
                            <NumberInput radius="lg" size="xs" disabled={tablefield.type == 'boolean'} placeholder='Min' value={tablefield.min} onChange={v => setTableField({ ...tablefield, min: v })} />
                            <NumberInput radius="lg" size="xs" disabled={tablefield.type == 'boolean'} placeholder='Max' value={tablefield.max} onChange={v => setTableField({ ...tablefield, max: v })} />
                          </div>
                        </div>
                      </div>


                      {/* All the fields */}
                      <div className="my-3"></div>
                      <Divider />
                      <div className="my-3"></div>

                      {table.fields.map((field, fieldindex) =>
                        <div key={table.name + field.name} className="flex gap-2 items-center bg-gray-50 p-2 border-2 border-gray-200 rounded-2xl">
                          <div className="cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2  items-center">
                              <Checkbox color="teal" />
                              <Input style={{ width: "100%", fontWeight: "bold" }} radius="lg" size="xs" placeholder='Field Name' value={field.name} />
                              <Tooltip label="Remove field">
                                <ActionIcon onClick={() => onRemoveField(table.index, fieldindex)} size="xs" variant='outline' color='gray'>
                                  <Trash2 size={12} />
                                </ActionIcon>
                              </Tooltip>
                            </div>

                            <div className="flex gap-2 items-center">

                              <Chip size="xs" icon={null} checked={true} variant="outline" color="teal">{field.type}</Chip>
                              <Tooltip label="Primary Key">
                                <ActionIcon disabled={!field.primarykey || field.type == 'boolean'} variant={'outline'} size="sm" color='orange' radius="lg">
                                  <KeyRound size={12} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Foreign Key">
                                <ActionIcon onClick={() => null} disabled={!field.foriegnkey || field.type == 'boolean'} variant={'outline'} size="sm" color='indigo' radius="lg">
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
                      )}


                    </Accordion.Panel>
                  </Accordion.Item>
                )}
              </Accordion>
            </div>
          </div>
        </Drawer>

        {/* Drawflow show tables */}
        <main className='w-screen h-screen fixed top-0 left-0'>
          <div id="drawflow" className='w-full h-full'></div>
          <div className='flex gap-2 justify-end relative -top-16 px-4'>
            <ActionIcon radius={20} color='gray' variant='outline' onClick={() => editor?.zoom_in()}>
              <ZoomInIcon />
            </ActionIcon>
            <ActionIcon radius={20} color='gray' variant='outline' onClick={() => editor?.zoom_out()}>
              <ZoomOutIcon />
            </ActionIcon>
            <ActionIcon radius={20} color='gray' variant='outline' onClick={() => editor?.zoom_reset()}>
              <RefreshCw />
            </ActionIcon>
            <ActionIcon radius={20} color='gray' variant='outline' onClick={() => editor?.zoom_max()}>
              <Maximize2Icon />
            </ActionIcon>
            <ActionIcon radius={20} color='gray' variant='outline' onClick={() => editor?.zoom_min()}>
              <Minimize2Icon />
            </ActionIcon>
          </div>
        </main>

        <Footer />

      </div>
    </MantineProvider>
  )
}

export default App