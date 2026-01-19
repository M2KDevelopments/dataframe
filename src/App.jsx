import Footer from './components/Footer'
import NavBar from './components/NavBar'
import { MantineProvider, Drawer, Button, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { useState } from 'react';
import { PanelRight } from 'lucide-react';

function App() {

  const [projectName, setProjectName] = useState(window.localStorage.getItem('project') || "New Project")
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <MantineProvider>
      <Notifications />

      <div className='w-full h-full'>
        <NavBar projectName={projectName} setProjectName={setProjectName} openDrawer={open} />

        <Drawer opened={opened} onClose={close} title="Authentication">
          {/* Drawer content */}
        </Drawer>

        

        <main className='w-full h-full'>

        </main>

        <Footer />

      </div>
    </MantineProvider>
  )
}

export default App