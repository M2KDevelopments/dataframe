import swal from 'sweetalert';
import { ActionIcon, Button, Menu } from '@mantine/core';
import { GroupIcon, HelpCircleIcon, LogsIcon, PanelRight, RecycleIcon, Redo2Icon, SaveAllIcon, SaveIcon,  Share2Icon, Undo2Icon } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { BsFiletypeJson, BsFiletypeSql } from 'react-icons/bs';
import { SiDrizzle, SiPrisma } from 'react-icons/si';

const width = 200;

function NavBar({ projectName, setProjectName, openDrawer }) {


    const onRename = async () => {
        const name = await swal({
            title: `Rename Project`,
            text: `Enter the name of the project`,
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
        window.localStorage.setItem('project', name || projectName);
        setProjectName(name || projectName)
    }

    const onFile = (value) => {
        switch (value) {
            case "open":
                break;

            case "save":
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
                        <Menu.Item onClick={() => onFile('open')}>Open</Menu.Item>
                        <Menu.Item onClick={() => onFile('save')} rightSection={<SaveIcon size={16} />}>Save</Menu.Item>
                        <Menu.Item onClick={() => onFile('saveas')} rightSection={<SaveAllIcon size={16} />}>Save As</Menu.Item>

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

                        <Menu.Divider />
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

                        <Menu.Item onClick={() => onFile('share')} rightSection={<Share2Icon size={16} />}>Share</Menu.Item>
                    </Menu.Dropdown>
                </Menu>


                <Menu shadow="md" width={width}>
                    <Menu.Target>
                        <Button variant='subtle' color='#b3f1df' size='xs'>View</Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>View</Menu.Label>
                        <Menu.Item onClick={() => onView('fullscreen')} rightSection={<span className='font-thin'>F11</span>}>Fullscreen</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item onClick={() => onView('undo')} rightSection={<Undo2Icon size={16} />}>Undo</Menu.Item>
                        <Menu.Item onClick={() => onView('redo')} rightSection={<Redo2Icon size={16} />}>Redo</Menu.Item>
                        <Menu.Item onClick={() => onView('reset')} rightSection={<RecycleIcon size={16} />}>Reset</Menu.Item>
                        <Menu.Divider />
                        {/* <Menu.Item onClick={() => onView('teams')} rightSection={<GroupIcon size={16} />}>Teams</Menu.Item> */}
                        <Menu.Item onClick={() => onView('logs')} rightSection={<LogsIcon size={16} />}>Logs</Menu.Item>

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

            </nav>
        </header>
    )
}

export default NavBar