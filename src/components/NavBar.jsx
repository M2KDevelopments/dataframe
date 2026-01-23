import swal from 'sweetalert';
import { ActionIcon, Button, Input, Menu, Modal, Tooltip, Alert } from '@mantine/core';
import { Download, HelpCircleIcon, PanelRight, Upload, X } from 'lucide-react';
import { FaGithub, FaMoneyBillWave, FaPaypal, FaSave } from 'react-icons/fa';
import { BsCode, BsFiletypeJson, BsFiletypeSql } from 'react-icons/bs';
import { SiBuymeacoffee, SiDrizzle, SiMongodb, SiPrisma } from 'react-icons/si';
import { notifications } from '@mantine/notifications';
import { MdCheck, MdDownload, MdWarning } from 'react-icons/md';
import { saveProject } from '../helpers/memory'
import { useMemo, useState } from 'react';
import { CodeHighlightControl, CodeHighlightTabs } from '@mantine/code-highlight';


// Dropzone
import { Group, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';

import ALLFORMATS from '../assets/codetypes.json';
import { getDrizzleFrom, getMongoose, getPrismaFrom, getSQLFrom } from '../helpers/transpiler';
import { parseDataFrameFile } from '../helpers/parser';


const width = 200;

function NavBar({ projectName, setProjectName, openDrawer, tables, setTables }) {


    const [loading, setLoading] = useState(false);
    const [url, setURL] = useState('');
    const [activeCodeTab, setActiveCodeTab] = useState(0);
    const [openDialogue, setOpenDialogue] = useState(false);
    const [importDialogue, setImportDialogue] = useState(false);
    const [exportDialogue, setExportDialogue] = useState(false);
    const { codeSQL, codeDrizzle, codeJSON, codePrisma, codeMongoose } = useMemo(() => {
        return {
            codeSQL: getSQLFrom(tables),
            codeDrizzle: getDrizzleFrom(tables),
            codeJSON: JSON.stringify(tables, null, 2),
            codePrisma: getPrismaFrom(tables),
            codeMongoose: getMongoose(tables),
        }
    }, [tables]);

    const readFile = (f) => new Promise((resolve) => {
        const reader = new FileReader(); // Create a new FileReader object

        // Define the onload event handler
        reader.onload = function (e) {
            const content = e.target.result; // The file content is in e.target.result
            resolve(content)
        };

        // Define the onerror event handler (optional, but good practice)
        reader.onerror = function (e) {
            console.error("Error reading file: ", e.target.error);
            notifications.show({
                title: "Uploading Error",
                message: e.target.error,
                color: "orange",
                position: "top-right",
                icon: <MdWarning />
            })
            resolve("");
        };

        // Read the file as text
        reader.readAsText(f);
    })

    /**
     * @param {File | null} f 
     */
    const onOpen = async (f) => {
        if (!f) return;

        // file type check
        if (!ALLFORMATS.some(name => f.name.toLowerCase().includes(`.${name}`))) {
            return notifications.show({
                title: "Uploading Error",
                message: "Invalid file type",
                color: "orange",
                position: "top-right",
                icon: <MdWarning />
            })
        }
        const content = await readFile(f);
        const tablelist = parseDataFrameFile(content);
        if (!tablelist) {
            return notifications.show({
                title: "Uploading Error",
                message: "Could read tables and fields from file",
                color: "orange",
                position: "top-right",
                icon: <MdWarning />
            })
        }
        setTables(tablelist);
        setProjectName(f.name.replace(/\..*/, '').trim())
        notifications.show({
            title: "Loaded Data",
            message: "Loaded " + f.name,
            color: "green",
            position: "top-right",
            icon: <MdDownload />
        })
    }

    const onImport = async (files) => {
        const allowedFiles = files.filter(f =>
            ALLFORMATS.some(name => f.name.toLowerCase().includes(`.${name}`))
        )
        if (allowedFiles.length == 0) {
            return notifications.show({
                title: "Uploading Error",
                message: 'All the files have invalid formats',
                color: "orange",
                position: "top-right",
                icon: <MdWarning />
            })
        }

        const tableNameMap = new Set();
        for (const table of tables) tableNameMap.add(table.name);
        const extratables = [];
        for (const f of allowedFiles) {
            const content = await readFile(f);
            const tablelist = parseDataFrameFile(content);
            if (!tablelist) {
                return notifications.show({
                    title: "Uploading Error",
                    message: "Could read tables and fields from file",
                    color: "orange",
                    position: "top-right",
                    icon: <MdWarning />
                })
            }
            extratables.push(...tablelist);
        }

        // Check for existing tables
        const existsalready = extratables.filter(t => tableNameMap.has(t.name));
        const addedTables = extratables.filter(t => !tableNameMap.has(t.name));
        if (existsalready.length > 0) {
            for (const { name } of existsalready) {
                notifications.show({
                    title: `Table ${name} exists`,
                    message: `${name} already exists. This won't be included`,
                    color: "gray",
                    position: "top-right",
                    icon: <MdWarning />
                })
            }
        }


        if (addedTables.length > 0) {
            setTables(prev => [...prev, ...addedTables].sort((a, b) => a.name.localeCompare(b.name)));
            notifications.show({
                title: "Added Tables",
                message: `Added ${addedTables.length} ${addedTables.length == 1 ? "Table" : "Tables"}`,
                color: "green",
                position: "top-right",
                icon: <MdCheck />
            })
        }
    }

    const onOpenUrl = async (url, addToTableList = false) => {
        try {
            setLoading(true);
            if (!url.trim()) return;
            const headers = { 'Content-Type': 'application/json', }
            const res = await fetch(url, { method: "GET", headers });
            const text = await res.text();

            if (text.includes("<pre>Cannot GET /")) {
                return notifications.show({
                    title: "Loading File Error",
                    message: "Could not find content",
                    color: "orange",
                    position: "top-right",
                    icon: <MdWarning />
                })
            }
            // const filetype = fileDetector(text);
            const list = parseDataFrameFile(text);
            if (!list) {
                return notifications.show({
                    title: "Uploading Error",
                    message: "Could read tables and fields from file",
                    color: "orange",
                    position: "top-right",
                    icon: <MdWarning />
                })
            }
            setProjectName("Dataframe")
            if (addToTableList) {
                const set = new Set();
                for (const table of tables) set.add(table.name);
                const exists = list.filter(table => set.has(table.name));
                const added = list.filter(table => !set.has(table.name));
                if (exists.length > 0) {
                    for (const { name } of exists) {
                        notifications.show({
                            title: `Table ${name} exists`,
                            message: `${name} already exists. This won't be included`,
                            color: "gray",
                            position: "top-right",
                            icon: <MdWarning />
                        })
                    }
                }

                if (added.length > 0) {
                    setTables(prev => [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name)));
                    notifications.show({
                        title: "Added Tables",
                        message: `Added ${added.length} ${added.length == 1 ? "Table" : "Tables"}`,
                        color: "green",
                        position: "top-right",
                        icon: <MdCheck />
                    })
                }


            } else {
                setTables(list);
            }
            notifications.show({
                title: "Loaded Data",
                message: "Loaded project from url",
                color: "green",
                position: "top-right",
                icon: <MdDownload />
            })
        } catch (e) {
            notifications.show({
                title: "Loading File Error",
                message: e.message,
                color: "orange",
                position: "top-right",
                icon: <MdWarning />
            })
        } finally {
            setLoading(false);
        }
    }

    const onDownloadCode = async ({ name, code, type }) => {
        const blob = new Blob([code], { type });
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create an anchor element for the download
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', url);
        downloadAnchorNode.setAttribute('download', name); // Set the filename

        // Append the link to the body (required for Firefox) and trigger the download
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();

        // Clean up: remove the link and revoke the URL
        document.body.removeChild(downloadAnchorNode);
        URL.revokeObjectURL(url);
    }

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
                color: "orange", position: "top-right",
                icon: <MdWarning />
            })
        }
        setProjectName(name || projectName)
    }

    const onFile = (value) => {

        const newProject = async () => {
            const name = await swal({
                title: `New Project`,
                text: `Creating a new project will remove/replace your current project. You probably want to export ${projectName} first.`,
                icon: "info",
                buttons: ['Cancel', 'Create New Project'],
                content: {
                    element: "input",
                    attributes: {
                        value: '',
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
                    color: "orange", position: "top-right",
                    icon: <MdWarning />
                })
            }
            setProjectName(name)
        }

        const saveAs = async () => {
            const name = await swal({
                title: `Save Project`,
                text: `The file will save in your downloads folder`,
                icon: "info",
                buttons: ['Cancel', 'Save'],
                content: {
                    element: "input",
                    attributes: {
                        value: projectName,
                        placeholder: "Enter the name of the project e.g DataFrame",

                    }
                }
            })

            if (name == undefined || name == null) return;
            if (name != '' && name.trim()) return;
            if (name != '') {
                if (!'qwertyuiopasdfghjklzxcvbnm1234567890-_'.split("").some(char => char == name[0].toLowerCase())) {
                    return notifications.show({
                        title: "Invalid Project Name",
                        message: "Please enter a valid project name. ",
                        color: "orange", position: "top-right",
                        icon: <MdWarning />
                    })
                }
            }
            onDownloadCode({ name: `${name || projectName}.json`, code: codeJSON, type: "application/json;charset=utf-8" })
            notifications.show({
                title: "Project Saved",
                message: `Successfully save ${projectName} in your downloads folder`,
                color: "green",
                position: "top-right",
                icon: <MdDownload />
            })
        }

        switch (value) {
            case "open":
                setOpenDialogue(true);
                break;

            case "new":
                newProject();
                break;

            case "save":
                saveProject(projectName, tables);
                notifications.show({ title: "Saved Project", message: `${projectName} was saved successfully`, icon: <MdCheck />, color: "green" })
                break;

            case "saveas":
                saveAs();
                break;

            case "import":
                setImportDialogue(true);
                break;

            case "export":
                setExportDialogue(true);
                break;

            default: break;
        }
    }

    const onView = (value) => {
        switch (value) {
            case 'fullscreen':
                if (document.fullscreenElement) document.exitFullscreen();
                else document.body.requestFullscreen();
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
                            <Menu.Item onClick={() => onFile('save')} rightSection={<span className='text-xs font-thin'>CTRL+S</span>}>Save</Menu.Item>
                            <Menu.Item onClick={() => onFile('saveas')} rightSection={<span className='text-xs font-thin'>CTRL+SHIFT+S</span>}>Save AS File</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item onClick={() => onFile('import')} rightSection={<Upload size={16} />}>Import</Menu.Item>
                            <Menu.Item onClick={() => onFile('export')} rightSection={<BsCode size={16} />}>Export</Menu.Item>
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


            <Modal size="lg" opened={openDialogue || importDialogue} onClose={() => { setOpenDialogue(false); setImportDialogue(false) }} title={openDialogue ? "Open Project" : "Import Tables"}>
                <div className='flex items-center w-full my-4'>
                    <Input disabled={loading} value={url} onChange={e => setURL(e.target.value)} className='w-[80%]' placeholder="URL to file e.g https://dataframe.m2kdevelopments.com/example.json" type="url" />
                    <Button disabled={loading} variant='outline' color="teal" onClick={() => onOpenUrl(url, importDialogue)}>Load URL</Button>
                </div>

                <Dropzone
                    onDrop={(files) => importDialogue ? onImport(files) : onOpen(files[0])}
                    onReject={(files) => notifications.show({
                        title: "File Error",
                        message: `Invalid file ${files.length ? files[0].file.name : ""}`,
                        color: "red",
                        position: "top-right",
                        icon: <MdWarning />
                    })}
                    multiple={importDialogue}
                    accept={["application/json"]}
                    maxSize={5 * 1024 ** 2}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <Upload size={52} color="gray" />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <X size={52} color="gray" />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <BsFiletypeJson size={52} color="gray" />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Drag DataFrame json file(s) here or click to select file
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                {importDialogue ?
                                    "File should not exceed 5mb"
                                    :
                                    "Attach as many file as you like, each file should not exceed 5mb"
                                }
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
                <br /><br />

                {openDialogue ? <Alert variant="light" color="orange" title="Opening a new project" icon={<MdWarning />}>
                    Opening a new project will remove/replace your current project. You probably want to export <b>{projectName}</b> first.
                </Alert> : null}
            </Modal>


            <Modal size="lg" opened={exportDialogue} onClose={() => setExportDialogue(false)} title="Export Code">
                <CodeHighlightTabs
                    activeTab={activeCodeTab}
                    onTabChange={tab => setActiveCodeTab(tab)}
                    code={[
                        { fileName: 'SQL', code: codeSQL, language: 'sql', icon: <BsFiletypeSql /> },
                        { fileName: 'Prisma', code: codePrisma, language: 'prisma', icon: <SiPrisma /> },
                        { fileName: 'Drizzle', code: codeDrizzle, language: 'javascript', icon: <SiDrizzle /> },
                        { fileName: 'Mongo', code: codeMongoose, language: 'javascript', icon: <SiMongodb /> },
                        { fileName: 'DataFrame', code: codeJSON, language: 'json', icon: <BsFiletypeJson /> },
                    ]}
                    controls={[
                        <CodeHighlightControl
                            component="button"
                            onClick={() => onDownloadCode([
                                {
                                    name: `${projectName}.sql`,
                                    code: codeSQL,
                                    type: "application/sql;charset=utf-8"
                                },
                                {
                                    name: "schema.prisma",
                                    code: codePrisma,
                                    type: "application/prisma;charset=utf-8"
                                },
                                {
                                    name: "schema.ts",
                                    code: codeDrizzle,
                                    type: "application/ts;charset=utf-8"
                                },
                                {
                                    name: `${projectName}.js`,
                                    code: codeMongoose,
                                    type: "application/js;charset=utf-8"
                                },
                                {
                                    name: `${projectName}.json`,
                                    code: codeJSON,
                                    type: "application/json;charset=utf-8"
                                }
                            ][activeCodeTab])}
                            tooltipLabel="Download Code as File"
                            key="download"
                        >
                            <Download />
                        </CodeHighlightControl>
                    ]}
                    copyLabel="Copy code"
                    copiedLabel="Copied!"
                    radius="lg"
                    expanded={true}
                    expandCodeLabel='Expanded'
                    codeColorScheme='light'
                    withBorder={true}
                />
            </Modal>
        </header >
    )
}

export default NavBar