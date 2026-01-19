import { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2Icon, Minimize2Icon, Plus, RefreshCw, SearchIcon, Table, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import { MdWarning } from 'react-icons/md';
import { MantineProvider, Drawer, Button, ActionIcon, Input, Accordion } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Drawflow from 'drawflow'
import 'drawflow/dist/drawflow.min.css';
import './drawflow.css';

function App() {

  const [projectName, setProjectName] = useState(window.localStorage.getItem('project') || "New Project")
  const [opened, { open, close }] = useDisclosure(false);
  const [tables, setTables] = useState([]);//[{name:string, fields:[ {name, type} ]}]
  const [tablename, setTablename] = useState('')
  const [search, setSearch] = useState('');
  const filteredTables = useMemo(() => tables.filter(table => !search.trim() || table.name.toLowerCase().includes(search.toLowerCase())), [tables, search])
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

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == name[0])) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "Please enter a valid table name",
        color: "orange",
        icon: <MdWarning />
      })
    }

    if (tables.some(t => t.name == name)) return;

    const table = { name, fields: [] }
    const inputs = 1;
    const outputs = 1;
    const posx = 90;
    const posy = 90;
    const className = '';
    const html = getNodeHTML(table);
    editor.addNode(name, inputs, outputs, posx, posy, className, table, html);
    setTables(prev => [...prev, table].sort((a, b) => a.name.localeCompare(b.name)));
    setTablename('');
  }, [editor, getNodeHTML, tables])





  return (
    <MantineProvider>
      <Notifications />

      <div className='w-full h-full'>
        <NavBar projectName={projectName} setProjectName={setProjectName} openDrawer={open} />

        <Drawer opened={opened} onClose={close} title={
          <div className='grid grid-cols-2'>
            {/* Adding Table */}
            <Input placeholder='Table Name' leftSection={<Table />} type='search' value={tablename} onChange={e => setTablename(e.target.value)} />
            <Button variant='filled' color='#104e64' leftSection={<Plus />} onClick={() => onAddTable(tablename)}>Add Table</Button>
          </div>
        }>
          <div className='flex flex-col gap-3 h-[90vh]'>

            {/* Search */}
            <Input.Wrapper label="Search">
              <Input placeholder='Search for Tables...' leftSection={<SearchIcon />} radius={"md"} type='search' value={search} onChange={e => setSearch(e.target.value)} />
            </Input.Wrapper>

            {/* Tables */}
            <div className='flex flex-col gap-2 overflow-y-scroll min-h-4/5 bg-slate-50 p-2 rounded-2xl border-slate-100'>
              <Accordion variant="contained" radius="md" defaultValue="">
                {filteredTables.map(table =>
                  <Accordion.Item key={table.name} value={table.name}>
                    <Accordion.Control icon={<Table size={16} />}>
                      {table.name}
                    </Accordion.Control>
                    <Accordion.Panel>Your Table Fields will go here</Accordion.Panel>
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