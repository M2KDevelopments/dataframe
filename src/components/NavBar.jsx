import React from 'react'
import { ActionIcon, Button, Combobox, useCombobox } from '@mantine/core';
import swal from 'sweetalert';
import { PanelRight } from 'lucide-react';

const width = 150;

function NavBar({ projectName, setProjectName, openDrawer }) {

    const comboboxFile = useCombobox({
        onDropdownClose: () => comboboxFile.resetSelectedOption(),
    });

    const comboboxView = useCombobox({
        onDropdownClose: () => comboboxView.resetSelectedOption(),
    });
    const comboboxHelp = useCombobox({
        onDropdownClose: () => comboboxHelp.resetSelectedOption(),
    });

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

            case "import":
                break;

            case "share":
                break;

            case "export":
                break;
            default: break;
        }
        comboboxFile.closeDropdown();
    }

    const onView = (value) => {
        switch (value) {
            case "open":
                break;

            case "save":
                break;

            case "saveas":
                break;

            case "export":
                break;
            default: break;
        }
        comboboxView.closeDropdown();
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
        comboboxHelp.closeDropdown();
    }


    return (
        <header className='w-full h-8 bg-cyan-900 shadow-2xl'>
            <nav className='flex gap-2 px-2 items-center'>
                <ActionIcon variant="filled" radius="md" size="lg" color='#104e64' onClick={openDrawer}>
                    <PanelRight size={18} />
                </ActionIcon>

                <Button radius={"lg"} variant='subtle' color='white' size='xs' onClick={onRename}>{projectName}</Button>

                <span className='text-white pointer-events-none text-xs font-thin'>|</span>

                <Combobox
                    store={comboboxFile}
                    width={width}
                    position="bottom-start"
                    withArrow

                    onOptionSubmit={(val) => onFile(val)}
                >
                    <Combobox.Target>
                        <Button variant='subtle' color='teal' size='xs' onClick={() => comboboxFile.toggleDropdown()}>File</Button>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            <Combobox.Option value="open">Open</Combobox.Option>
                            <Combobox.Option value="save">Save</Combobox.Option>
                            <Combobox.Option value="saveas">Save As</Combobox.Option>
                            <Combobox.Option value="import">Import</Combobox.Option>
                            <Combobox.Option value="export">Export</Combobox.Option>
                            <Combobox.Option value="share">Share</Combobox.Option>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>

                <Combobox
                    store={comboboxView}
                    width={width}
                    position="bottom-start"
                    withArrow
                    onOptionSubmit={(val) => onView(val)}
                >
                    <Combobox.Target>
                        <Button variant='subtle' color='teal' size='xs' onClick={() => comboboxView.toggleDropdown()}>View</Button>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            <Combobox.Option value="fullscreen">Fullscreen</Combobox.Option>
                            <Combobox.Option value="logs">Logs</Combobox.Option>
                            <Combobox.Option value="undo">Undo</Combobox.Option>
                            <Combobox.Option value="redo">Redo</Combobox.Option>
                            <Combobox.Option value="reset">Reset</Combobox.Option>
                            <Combobox.Option value="teams">Teams</Combobox.Option>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>


                <Combobox
                    store={comboboxHelp}
                    width={width}
                    position="bottom-start"
                    withArrow
                    onOptionSubmit={(val) => onHelp(val)}
                >
                    <Combobox.Target>
                        <Button variant='subtle' color='teal' size='xs' onClick={() => comboboxHelp.toggleDropdown()}>Help</Button>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            <Combobox.Option value="github">Github</Combobox.Option>
                            <Combobox.Option value="tour">Tour Guide</Combobox.Option>
                            <Combobox.Option value="terms">Terms</Combobox.Option>
                            <Combobox.Option value="privacypolicy">Privacy Policy</Combobox.Option>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            </nav>
        </header>
    )
}

export default NavBar