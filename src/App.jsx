import { useMemo, useState } from 'react';
import { Plus, SearchIcon, Table } from 'lucide-react';
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import { MantineProvider, Drawer, Button, ActionIcon, Input, Accordion } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MdWarning } from 'react-icons/md';

function App() {

  const [projectName, setProjectName] = useState(window.localStorage.getItem('project') || "New Project")
  const [opened, { open, close }] = useDisclosure(false);
  const [tables, setTables] = useState([]);//[{name:string, fields:[ {name, type} ]}]
  const [tablename, setTablename] = useState('')
  const [search, setSearch] = useState('');
  const filteredTables = useMemo(() => tables.filter(table => !search.trim() || table.name.toLowerCase().includes(search.toLowerCase())), [tables, search])


  const onAddTable = (name) => {
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

    setTables(prev => {
      if (prev.some(t => t.name == name)) return prev;
      return [...prev, { name, fields: [] }].sort((a, b) => a.name.localeCompare(b.name))
    })
    setTablename('');
  }

  return (
    <MantineProvider>
      <Notifications />

      <div className='w-full h-full'>
        <NavBar projectName={projectName} setProjectName={setProjectName} openDrawer={open} />

        <Drawer opened={opened} onClose={close} title={
          <div className='grid grid-cols-2'>
            {/* Adding Table */}
            <Input placeholder='Table Name' leftSection={<Table />} type='search' value={tablename} onChange={e => setTablename(e.target.value)} />
            <Button variant='filled'  color='#104e64' leftSection={<Plus />} onClick={() => onAddTable(tablename)}>Add Table</Button>
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

        <main className='w-screen h-screen fixed top-0 left-0'>

        </main>

        <Footer />

      </div>
    </MantineProvider>
  )
}

export default App