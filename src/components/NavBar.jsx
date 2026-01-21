import swal from 'sweetalert';
import { ActionIcon, Button, Menu, Tooltip } from '@mantine/core';
import { GroupIcon, HelpCircleIcon, LogsIcon, PanelRight, RecycleIcon, Redo2Icon, SaveAllIcon, SaveIcon, Share2Icon, Undo2Icon } from 'lucide-react';
import { FaCcPaypal, FaGithub, FaMoneyBillWave, FaPaypal, FaSave } from 'react-icons/fa';
import { BsFiletypeJson, BsFiletypeSql } from 'react-icons/bs';
import { SiBuymeacoffee, SiDrizzle, SiPrisma } from 'react-icons/si';
import { notifications } from '@mantine/notifications';
import { MdCheck, MdSupport, MdWarning } from 'react-icons/md';
import { saveProject } from '../helpers/memory'

const width = 200;

function NavBar({ projectName, setProjectName, openDrawer, tables }) {


    const onRename = async () => {
        const name = await swal({
            title: `Rename Project`,
            text: `Enter the name of the project`,
            icon: "info",
            buttons: ['Cancel', 'Rename'],
            content: {
                element: "input",
                attributes: {
                    value: projectName,
                    placeholder: "Project Name...",

                }
            }
        })

        if (!name) return;
        if (!name.trim()) return;
        if (!'qwertyuiopasdfghjklzxcvbnm1234567890-_'.split("").some(char => char == name[0].toLowerCase())) {
            return notifications.show({
                title: "Invalid Table Name",
                message: "Please enter a valid table name",
                color: "orange",
                icon: <MdWarning />
            })
        }
        window.localStorage.setItem('project', name || projectName);
        setProjectName(name || projectName)
    }

    const onFile = (value) => {

        const newProject = async () => {
            const name = await swal({
                title: `New Project`,
                text: `Enter the name of the new project`,
                icon: "info",
                buttons: ['Cancel', 'Rename'],
                content: {
                    element: "input",
                    attributes: {
                        value: 'DataFrame',
                        placeholder: "Enter the name of the project e.g DataFrame",

                    }
                }
            })
            if (!name) return;
            if (!name.trim()) return;
            if (!'qwertyuiopasdfghjklzxcvbnm1234567890-_'.split("").some(char => char == name[0].toLowerCase())) {
                return notifications.show({
                    title: "Invalid Project Name",
                    message: "Please enter a valid project name. ",
                    color: "orange",
                    icon: <MdWarning />
                })
            }
            window.localStorage.setItem('project', name);
            setProjectName(name)
        }

        switch (value) {
            case "open":
                break;

            case "new":
                newProject();
                break;

            case "save":
                saveProject(projectName, tables);
                notifications.show({ title: "Saved Project", message: `${projectName} was saved successfully`, icon: <MdCheck />, color: "green" })
                break;

            case "saveas":
                break;

            case "import-json":
                break;

            case "import-sql":
                break;

            case "import-drizzle":
                break;

            case "import-prisma":
                break;

            case "share":
                break;

            case "export-json":
                break;

            case "export-sql":
                break;

            case "export-prisma":
                break;

            case "export-drizzle":
                break;

            default: break;
        }
    }

    const onView = (value) => {
        switch (value) {
            case 'fullscreen':
                break;
            case 'logs':
                break;
            case 'undo':
                break;
            case 'redo':
                break;
            case 'reset':
                break;
            case 'teams':
                break;
            default: break;
        }
    }


    const onHelp = (value) => {
        switch (value) {
            case "github":
                window.open('https://github.com/M2KDevelopments/dataframe', '_blank');
                break;
            case "tour":
                break;
            case "terms":
                window.open('/terms', '_blank');
                break;
            case "privacypolicy":
                window.open('/privacypolicy', '_blank');
                break;
            default: break;
        }
    }


    return (
        <header className='w-full h-10 bg-cyan-900 shadow-2xl fixed top-0 left-0 z-10'>
            <nav className='flex gap-2 px-2 items-center'>
                <div className='flex gap-2 px-2 items-center'>
                    <ActionIcon variant="filled" radius="md" size="lg" color='#104e64' onClick={openDrawer}>
                        <PanelRight size={18} />
                    </ActionIcon>

                    <Button radius={"lg"} variant='subtle' color='white' size='xs' onClick={onRename}>{projectName}</Button>

                    <span className='text-white pointer-events-none text-xs font-thin'>|</span>

                    <Menu shadow="md" width={width}>
                        <Menu.Target>
                            <Button variant='subtle' color='#b3f1df' size='xs'>File</Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>{projectName}</Menu.Label>
                            <Menu.Item onClick={() => onFile('open')} rightSection={<span className='text-xs font-thin'>CTRL+O</span>}>Open</Menu.Item>
                            <Menu.Item onClick={() => onFile('new')} rightSection={<span className='text-xs font-thin'>CTRL+N</span>}>New</Menu.Item>

                            <Menu.Divider />

                            <Menu.Item onClick={() => onFile('save')} rightSection={<span className='text-xs font-thin'>CTRL+S</span>}>Save</Menu.Item>
                            {/* <Menu.Item onClick={() => onFile('saveas')} rightSection={<span className='text-xs font-thin'>CTRL+SHIFT+S</span>}>Save As</Menu.Item> */}
                            {/* <Menu.Divider /> */}
                            <Menu.Sub>
                                <Menu.Sub.Target>
                                    <Menu.Sub.Item>Import</Menu.Sub.Item>
                                </Menu.Sub.Target>

                                <Menu.Sub.Dropdown>
                                    <Menu.Item onClick={() => onFile('import-json')} leftSection={<BsFiletypeJson size={16} />}>JSON (*.json)</Menu.Item>
                                    <Menu.Item onClick={() => onFile('import-sql')} leftSection={<BsFiletypeSql size={16} />}>SQL (*.sql)</Menu.Item>
                                    <Menu.Item onClick={() => onFile('import-prisma')} leftSection={<SiPrisma size={16} />}>Prisma Schema</Menu.Item>
                                    <Menu.Item onClick={() => onFile('import-drizzle')} leftSection={<SiDrizzle size={16} />}>Drizzle Schema</Menu.Item>
                                </Menu.Sub.Dropdown>
                            </Menu.Sub>

                            <Menu.Sub>
                                <Menu.Sub.Target>
                                    <Menu.Sub.Item>Export</Menu.Sub.Item>
                                </Menu.Sub.Target>

                                <Menu.Sub.Dropdown>
                                    <Menu.Item onClick={() => onFile('export-json')} leftSection={<BsFiletypeJson size={16} />}>JSON (*.json)</Menu.Item>
                                    <Menu.Item onClick={() => onFile('export-sql')} leftSection={<BsFiletypeSql size={16} />}>SQL (*.sql)</Menu.Item>
                                    <Menu.Item onClick={() => onFile('export-prisma')} leftSection={<SiPrisma size={16} />}>Prisma Schema</Menu.Item>
                                    <Menu.Item onClick={() => onFile('export-drizzle')} leftSection={<SiDrizzle size={16} />}>Drizzle Schema</Menu.Item>
                                </Menu.Sub.Dropdown>
                            </Menu.Sub>

                            {/* <Menu.Item onClick={() => onFile('share')} rightSection={<Share2Icon size={16} />}>Share</Menu.Item> */}
                        </Menu.Dropdown>
                    </Menu>


                    <Menu shadow="md" width={width}>
                        <Menu.Target>
                            <Button variant='subtle' color='#b3f1df' size='xs'>View</Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>View</Menu.Label>
                            <Menu.Item onClick={() => onView('fullscreen')} rightSection={<span className='font-thin'>F11</span>}>Fullscreen</Menu.Item>
                            {/* <Menu.Divider /> */}
                            {/* <Menu.Item onClick={() => onView('undo')} leftSection={<Undo2Icon size={12} />} rightSection={<span className='text-xs font-thin'>CTRL+Z</span>}>Undo</Menu.Item> */}
                            {/* <Menu.Item onClick={() => onView('redo')} leftSection={<Redo2Icon size={12} />} rightSection={<span className='text-xs font-thin'>CTRL+Y</span>}>Redo</Menu.Item> */}
                            {/* <Menu.Divider /> */}
                            {/* <Menu.Item onClick={() => onView('teams')} rightSection={<GroupIcon size={16} />}>Teams</Menu.Item> */}
                            {/* <Menu.Item onClick={() => onView('logs')} rightSection={<LogsIcon size={12} />}>Logs</Menu.Item> */}

                        </Menu.Dropdown>
                    </Menu>


                    <Menu shadow="md" width={width}>
                        <Menu.Target>
                            <Button variant='subtle' color='#b3f1df' size='xs'>Help</Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Help & Support</Menu.Label>
                            <Menu.Item onClick={() => onHelp('tour')} rightSection={<HelpCircleIcon size={16} />}>Tour Guide</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item onClick={() => onHelp('github')} rightSection={<FaGithub size={16} />}>Github</Menu.Item>
                            <Menu.Item onClick={() => onHelp('terms')}>Terms</Menu.Item>
                            <Menu.Item onClick={() => onHelp('privacypolicy')}>Privacy Policy</Menu.Item>

                        </Menu.Dropdown>
                    </Menu>
                </div>

                <div className='flex w-full items-center justify-end gap-3 px-4'>
                    <Tooltip label="Support me on Paychangu">
                        <ActionIcon variant="subtle" radius="lg" size="md" color='white' onClick={() => window.open('https://give.paychangu.com/dc-RqLWVw', '_blank')}>
                            <FaMoneyBillWave size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Buy Me a Coffee">
                        <ActionIcon variant="subtle" radius="lg" size="md" color='white' onClick={() => window.open('https://www.buymeacoffee.com/m2kdevelopments', '_blank')}>
                            <SiBuymeacoffee size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Support me via Paypal">
                        <ActionIcon variant="subtle" radius="lg" size="md" color='white' onClick={() => window.open('https://paypal.me/m2kdevelopment', '_blank')}>
                            <FaPaypal size={18} />
                        </ActionIcon>
                    </Tooltip>
                </div>

            </nav>
        </header>
    )
}

export default NavBar