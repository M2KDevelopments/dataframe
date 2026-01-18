import Footer from './components/Footer'
import NavBar from './components/NavBar'
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {

  const projectName = window.localStorage.getItem('project') || "New Project"

  return (
    <MantineProvider>
      <Notifications />
      <div className='w-screen h-screen'>
        <NavBar projectName={projectName} />
        <main className='w-full h-full'>

        </main>
        <Footer />
      </div>
    </MantineProvider>
  )
}

export default App