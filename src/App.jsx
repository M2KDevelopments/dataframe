import { useCallback, useEffect, useMemo, useState } from 'react';

// Components
import DataField from './components/DataField';
import NavBar from './components/NavBar'
import FIELD_TYPES from './assets/datatypes.json';
import tourguide from './assets/tour.json';
// UI Library
import swal from 'sweetalert';
import { TourProvider } from '@reactour/tour'
import { MdCheck, MdWarning } from 'react-icons/md';
import { ArrowDown01, Clock, ClockAlertIcon, ClockArrowUp, Edit2, EditIcon, HelpCircle, KeyRound, Maximize2Icon, Plus, RefreshCw, SearchIcon, Sparkle, Table, Trash2, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { MantineProvider, Drawer, Button, ActionIcon, Input, Accordion, Tooltip, Select, NumberInput, Divider, Modal, Switch, Alert, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications, Notifications } from '@mantine/notifications';
import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/dropzone/styles.css';

// Shiki requires async code to load the highlighter
async function loadShiki() {
  const { createHighlighter } = await import('shiki');
  const shiki = await createHighlighter({
    langs: ['json', 'sql', 'prisma', 'javascript'],
    // You can load supported themes here
    themes: [],
  });

  return shiki;
}

const shikiAdapter = createShikiAdapter(loadShiki);


// Drag and Drop Dnd Kit
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PointerSensor, KeyboardSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';

// Drawflow Node Connector
import Drawflow from 'drawflow'
import 'drawflow/dist/drawflow.min.css';
import './drawflow.css';
import { getProject } from './helpers/memory';
import FirstTime from './components/FirstTime';


const DEFAULT_FIELD = {
  name: "",
  type: FIELD_TYPES[0].value,
  unique: false,
  primarykey: false,
  autoincrement: false,
  foreignkey: "",
  min: "",
  max: "",
}


function App() {


  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState("DataFrame")
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [drawflowEditor, setDrawFlowEditor] = useState(null);

  // Drag and Drop Dnd Kit
  const [dragId, setDragId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Tables and Fields
  const [tables, setTables] = useState([]); //[{x,y,opened, name:string, timestamp:false, fields:[ {name, type} ]}]
  const [tablename, setTablename] = useState('')
  const [tablefield, setTableField] = useState(DEFAULT_FIELD)
  const [editField, setEditField] = useState(null);
  const [foreignkeySelected, setForeignkeySelected] = useState("")
  const [nodeForeignKeyEditDialgoue, setNodeForeignKeyEditDialogue] = useState(null) // {tableToConnect, fields}
  const [tableListOfForeignKeys, setForeignKeyOptions] = useState([]);
  const [selectedFieldsSet, setSelectedFieldsSet] = useState(new Set());

  // Search filtered list
  const filteredTables = useMemo(() => tables
    .map((t, idx) => ({ ...t, index: idx }))
    .filter((table) => !search.trim() || table.name.toLowerCase().includes(search.toLowerCase())),
    [tables, search])

  // Get Foreign Option when edting a field for a table
  const foreignKeyOptions = useMemo(() => !editField ? [] : [
    { label: "<NONE>", value: "" },
    ...tables
      .filter((t, i) => i != editField.tableindex && t.fields.some(f => f.primarykey && f.type == editField.type))
      .map(t => ({ label: t.name, value: t.name }))
  ], [editField, tables]);


  useEffect(() => {
    // Load Drawflow
    if (!document.querySelector('.drawflow')) {
      var id = document.getElementById("drawflow");
      const editor = new Drawflow(id);

      editor.reroute = true;
      editor.start();

      setDrawFlowEditor(editor);

      /********************
       * Handle Node Events 
       * 
       *******************/
      let selectedTable = null;
      editor.on("nodeSelected", (id) => {
        const { data } = editor.getNodeFromId(id);
        selectedTable = data;
      })
      editor.on("nodeRemoved", async () => {
        if (selectedTable) {
          const result = await swal({
            title: "Remove Table",
            text: `Are you sure want to remove ${selectedTable.name}? This will remove all connections related to this table`,
            icon: "info",
            buttons: ['Cancel', 'Remove']
          })
          if (!result) setTables(prev => [...prev]);
          else setTables(prev => {
            // remove all foreign key connections
            for (const i in prev) {
              for (const j in prev[i].fields) {
                if (prev[i].fields[j].foreignkey == selectedTable.name) {
                  prev[i].fields[j].foreignkey = '';
                }
              }
            }
            return prev.filter(t => t.name != selectedTable.name)
          })
        }
      })

      editor.on("connectionCreated", (event) => {
        const { input_id, output_id } = event;
        const { data: primaryKeytable } = editor.getNodeFromId(output_id);
        const { data: foreignKeytable } = editor.getNodeFromId(input_id)
        // check if there is primary
        const primarykey = primaryKeytable.fields.find(f => f.primarykey)
        if (!primarykey) {
          notifications.show({
            title: "Primary Key does NOT Exist",
            message: `${primaryKeytable.name} does NOT have a primary key. Please create one`,
            color: "orange", position: "top-right",
            icon: <MdWarning />
          });
          return setTables(prev => [...prev])
        }

        // if the tables are already connected leave it alone
        if (foreignKeytable.fields.some(f => f.foreignkey == primaryKeytable.name)) return;

        // check if there is primary
        if (!foreignKeytable.fields.some(f => f.type == primarykey.type && !f.primarykey)) {
          notifications.show({
            title: "Foreign Key Issue",
            message: `Could not find a field with the same data type as ${primarykey.name}`,
            color: "orange", position: "top-right",
            icon: <MdWarning />
          });
          return setTables(prev => [...prev])
        }


        setNodeForeignKeyEditDialogue({
          tableIndex: foreignKeytable.index,
          tableToConnect: primaryKeytable.name,
          fields: foreignKeytable.fields.filter(f => f.type == primarykey.type && !f.primarykey)
        })

      })

      editor.on("connectionRemoved", (event) => {

        const { input_id } = event;
        const { data: table } = editor.getNodeFromId(input_id)
        for (const i in table.fields) {
          if (table.fields[i].foreignkey) {
            table.fields[i].foreignkey = "";
            break;
          }
        }
        setTables(prev => {
          const data = { ...table };
          delete data["index"];
          prev[table.index] = data;
          return [...prev]
        })
      });
      editor.on("nodeMoved", (id) => {
        const { data: table, pos_x, pos_y } = editor.getNodeFromId(id);
        table.x = pos_x;
        table.y = pos_y;
        setTables(prev => {
          const data = { ...table };
          delete data["index"];
          prev[table.index] = data;
          return [...prev]
        })
      })

    }

    const data = getProject();
    setProjectName(data.name || "DataFrame")
    setTables(data.tables || []);

  }, [])


  // Redraw when table chhages
  useEffect(() => {
    if (drawflowEditor) {
      drawflowEditor.clear();
      const tableNameAndIdMap = new Map();
      const tableIdAndNameMap = new Map();
      for (const table of tables) {

        const inputs = 1;
        const outputs = 1;
        const posx = table.x || 90;
        const posy = table.y || 90;
        const className = table.name;
        const html = `
        <details id="table-${table.name}" ${table.opened ? "open" : ""} class="p-2 rounded-lg w-72 border border-gray-200">
          <summary class="cursor-pointer list-none">
            <div class="flex gap-2 items-center justify-between">
              <span class="font-bold text-md px-6">${table.name} (${table.fields.length})</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </summary>
          
          <div class="flex flex-col gap-3 mt-3">
            ${table.fields.map(field =>
          `<p class="text-sm"> 
            <span class="font-bold">${field.name}</span>
            <span class="font-thin text-xs">${field.type}</span>
            <span class="font-thin text-xs">${field.primarykey ? " PRIMARY KEY" : ""}</span>
            <span class="font-thin text-xs">${field.foreignkey ? " FOREIGN KEY" : ""}</span>
            <span class="font-thin text-xs">${field.unique ? " UNIQUE" : ""}</span>
            <span class="font-thin text-xs">${field.autoincrement ? " AUTOINCREMENT" : ""}</span>
          </p>
          <hr/>
        `
        ).join("\n")}
        ${table.timestamp ? `
            ${['createdAt', 'updatedAt'].map(name =>
          `<p class="text-sm"> 
              <span class="font-bold">${name}</span>
              <span class="font-thin text-xs">timestamp</span>
            </p>
            <hr/>
            `).join('\n')}
            `: ''}
          </div>
        </details>
      `;
        const id = drawflowEditor.addNode(table.name, inputs, outputs, posx, posy, className, table, html);
        tableNameAndIdMap.set(table.name, id);
        tableIdAndNameMap.set(id, table);
      }


      for (const index in tables) {
        const table = tables[index];
        table.index = index;
        for (const field of table.fields) {
          if (field.foreignkey) {
            const tablename = field.foreignkey;
            const outputNodeId = tableNameAndIdMap.get(tablename);
            const inputNodeId = tableNameAndIdMap.get(table.name);
            drawflowEditor.addConnection(outputNodeId, inputNodeId, 'output_1', 'input_1');
          }
        }
      }

      // add on open/close accordion
      for (const i in tables) {
        const details = document.getElementById(`table-${tables[i].name}`);

        details.ontoggle = () => {
          if (tables[i].opened != details.open) {
            setTables(prev => { prev[i].opened = details.open; return [...prev] })
          }
        };

      }
    }
  }, [tables, drawflowEditor])

  const handleDragStart = (event) => setDragId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setDragId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = parseInt(active.id.split("-")[1])
    const newIndex = parseInt(over.id.split("-")[1])
    if (oldIndex === -1 || newIndex === -1) return;
    const tableIndex = parseInt(active.id.split("-")[0])
    const [moved] = tables[tableIndex].fields.splice(oldIndex, 1);
    tables[tableIndex].fields.splice(newIndex, 0, moved);
    setTables([...tables]);
  };


  const onTourStep = (number) => {
    const drawerIndex = tourguide.findIndex(t => t.selector == '.tour-schema');
    const navIndex = tourguide.findIndex(t => t.selector == '.tour-nav');
    if (number > drawerIndex && number < navIndex) {
      if (!opened) open();
    } else {
      if (opened) close();
    }
    setCurrentStep(number);
  }

  const invalidName = useCallback((name) => {
    if (name.includes(" ")) return true;
    if (!name || !name.trim()) return false;
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == name[0].toLowerCase())) {
      return true;
    }
    return false;
  }, []);

  const onAddTable = useCallback((name) => {
    if (!name || !name.trim()) return;

    if (name.includes(" ")) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "No whitesplaces in table name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Table Name",
        message: "Please enter a valid table name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    if (tables.some(t => t.name == name)) return;

    const table = { x: 90, y: 90, opened: true, name, timestamp: false, fields: [] }
    setTables(prev => [...prev, table].sort((a, b) => a.name.localeCompare(b.name)));
    setTablename('');

    //refocus on field
    const input = document.getElementById('tablefield');
    if (input) input.focus();

    return notifications.show({ title: "Table Added", message: `${name} was added successfully`, color: "green", position: "top-right", icon: <MdCheck /> })
  }, [tables])

  const onPrimaryKey = useCallback((tableindex, field) => {
    if (tables[tableindex].fields.some(f => f.primarykey)) return notifications.show({
      title: "Primary Key Exist",
      message: `${tables[tableindex].name} already has a primary key`,
      color: "orange", position: "top-right",
      icon: <MdWarning />
    });
    setTableField({ ...field, primarykey: !field.primarykey })
  }, [tables]);

  const onForeignKeyField = useCallback((tableindex, field) => {
    if (field.primarykey) return notifications.show({
      title: "Field Issue",
      message: "This field is already a primary key",
      color: "orange", position: "top-right",
      icon: <MdWarning />
    });

    if (tables[tableindex].fields.some(f => f.foreignkey)) return notifications.show({
      title: "Foreign Key Exist",
      message: `${tables[tableindex].name} already has a foreign key`,
      color: "orange", position: "top-right",
      icon: <MdWarning />
    });

    setForeignKeyOptions(
      [
        { label: "<NONE>", value: "" },
        ...tables
          .filter((t, i) => tableindex != i && t.fields.some(f => f.primarykey && f.type == field.type))
          .map(t => ({ label: t.name, value: t.name }))
      ]
    )

  }, [tables])

  const onTableTimestamp = useCallback(async (index) => {
    tables[index].timestamp = !tables[index].timestamp;
    setTables([...tables]);
    const on = tables[index].timestamp;

    notifications.show({
      title: `Timestamps ${on ? "Set" : "Removed"}`,
      message: `${tables[index].name} has timestamps turned ${on ? "ON" : "OFF"}`,
      color: "green",
      position: "top-right",
      icon: on ? <ClockArrowUp /> : <ClockAlertIcon />
    });
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
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    if (tables.some(t => t.name == name)) {
      return notifications.show({
        title: "Table already exists",
        message: `${name} already exists in your list`,
        color: "orange", position: "top-right",
        icon: <MdWarning />
      });
    }

    tables[index].name = name;
    setTables([...tables]);
  }, [tables]);

  const onRemoveTable = useCallback(async (table) => {

    const field = table.fields.find(f => f.primarykey);

    if (field && field.primarykey) {
      const tName = table.name;
      const list = tables.filter(t => t.fields.some(f => f.foreignkey == tName)).map(t => t.name);
      if (list.length > 0) {
        const remove = await swal({
          title: `Remove Table`,
          text: `Are you sure you want remove Table '${tName}. ${list.length} foreign key(s) connected to this table.`,
          icon: "warning",
          buttons: {
            cancel: "Cancel",
            remove: {
              text: "Just Remove Table",
              value: "remove",
            },
            removeAll: {
              text: "Remove with Connected Tables",
              value: "removeAll",
            }
          }
        })
        if (!remove) return;

        if (remove == 'remove') {
          for (const i in tables) {
            for (const j in tables[i].fields) {
              if (tables[i].fields[j].foreignkey == tName) {
                tables[i].fields[j].foreignkey = '';
              }
            }
          }

          setTables(tables.filter(t => t.name != table.name));
        } else if (remove == 'removeAll') {
          setTables(tables.filter(t => t.name != table.name && !t.fields.some(f => f.foreignkey == tName)));
        }

        return notifications.show({
          title: "Table Removed",
          message: "Field was removed",
          color: "green", position: "top-right",
          icon: <MdCheck />
        })
      }
    }

    const result = await swal({
      title: `Remove ${table.name}`,
      text: `Are you sure you want remove Table '${table.name}'`,
      icon: "warning",
      buttons: ['Cancel', 'Remove']
    })

    if (!result) return;
    setTables(tables.filter(t => t.name != table.name));
  }, [tables]);

  const onAddField = useCallback(async (tableIndex, field) => {

    if (!field.name) return;

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == field.name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "Please enter a valid field name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    if (field.name.includes(" ")) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "No whitesplaces in field name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    // check if it already exists
    if (tables[tableIndex].fields.some(f => f.name == field.name)) {
      return notifications.show({
        title: "Field already exists",
        message: `${field.name} already exists in the ${tables[tableIndex].name} Table`,
        color: "orange", position: "top-right",
        icon: <MdWarning />
      });
    }

    // check for primary keys
    if (tables[tableIndex].fields.some((f) => f.primarykey && field.primarykey)) {
      return notifications.show({
        title: "Primary Key already exists",
        message: "There is a primary key already in this table",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    // check for foreign keys
    if (tables[tableIndex].fields.some((f) => f.foreignkey && field.foreignkey)) {
      return notifications.show({
        title: "Foreign Key already exists",
        message: "There is a primary key already in this table",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    // Check min and max are avlue
    if (field.min != '' && field.max != '') {
      if (isNaN(field.min)) {
        return notifications.show({
          title: "Invalid min value",
          message: `${field.name}'s max value should be a number`,
          color: "orange", position: "top-right",
          icon: <MdWarning />
        });
      }

      if (isNaN(field.max)) {
        return notifications.show({
          title: "Invalid max value",
          message: `${field.name}'s max value should be a number`,
          color: "orange", position: "top-right",
          icon: <MdWarning />
        });
      }
      const max = parseFloat(field.max);
      const min = parseFloat(field.min)
      if (max <= min) {
        return notifications.show({
          title: "Invalid max and min values",
          message: `${field.name}'s max value should be greater than the min value`,
          color: "orange", position: "top-right",
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

    notifications.show({
      title: "Field Added",
      message: `${field.name} was added successfully`,
      color: "green", position: "top-right",
      icon: <MdCheck />
    })
  }, [tables])

  const onEditField = useCallback(() => {
    const tableIndex = editField.tableindex;
    const field = tables[editField.tableindex].fields[editField.index];


    if (!field.name) return;

    // validate name
    if (!'qwertyuiopasdfghjklzxcvbnm_'.split("").some(char => char == field.name[0].toLowerCase())) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "Please enter a valid field name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    if (field.name.includes(" ")) {
      return notifications.show({
        title: "Invalid Field Name",
        message: "No whitesplaces in field name",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    // check for primary keys
    if (editField.primarykey && tables[tableIndex].fields.some((f, i) => f.primarykey && i != editField.index)) {
      return notifications.show({
        title: "Primary Key already exists",
        message: "There is a primary key already in this table",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }
    // check for foreign keys
    if (editField.foreignkey && tables[tableIndex].fields.some((f, i) => f.foreignkey && i != editField.index)) {
      return notifications.show({
        title: "Foreign Key already exists",
        message: "There is a primary key already in this table",
        color: "orange", position: "top-right",
        icon: <MdWarning />
      })
    }

    if (editField.primarykey && editField.foreignkey) {
      return notifications.show({
        title: "Primary and Foreign Key",
        message: `Primary key and foreign key were set to the same field`,
        color: "orange", position: "top-right",
        icon: <MdWarning />
      });
    }

    // check if it already exists
    if (tables[tableIndex].fields.some((f, i) => f.name == field.name && i != editField.index)) {
      return notifications.show({
        title: "Field already exists",
        message: `${field.name} already exists in the ${tables[tableIndex].name} Table`,
        color: "orange", position: "top-right",
        icon: <MdWarning />
      });
    }

    // Check min and max are avlue
    if (field.min != '' && field.max != '') {
      if (isNaN(field.min)) {
        return notifications.show({
          title: "Invalid min value",
          message: `${field.name}'s max value should be a number`,
          color: "orange", position: "top-right",
          icon: <MdWarning />
        });
      }

      if (isNaN(field.max)) {
        return notifications.show({
          title: "Invalid max value",
          message: `${field.name}'s max value should be a number`,
          color: "orange", position: "top-right",
          icon: <MdWarning />
        });
      }
      const max = parseFloat(field.max);
      const min = parseFloat(field.min)
      if (max <= min) {
        return notifications.show({
          title: "Invalid max and min values",
          message: `${field.name}'s max value should be greater than the min value`,
          color: "orange", position: "top-right",
          icon: <MdWarning />
        });
      }
    }

    //disabled primary key
    if (tables[editField.tableindex].fields[editField.index].primarykey && !editField.primarykey) {
      for (const i in tables) {
        for (const j in tables[i].fields) {
          if (tables[i].fields[j].foreignkey == tables[editField.tableindex].name) {
            tables[i].fields[j].foreignkey = '';
          }
        }
      }
    }

    tables[editField.tableindex].fields[editField.index] = {
      name: editField.name,
      type: editField.type,
      unique: editField.unique,
      primarykey: editField.primarykey,
      autoincrement: editField.autoincrement,
      foreignkey: editField.foreignkey,
      min: editField.min,
      max: editField.max,
    }
    setTables([...tables])
    setEditField(null);
    notifications.show({
      title: "Field Updated",
      message: `${editField.name} was updated successfully`,
      color: "green", position: "top-right",
      icon: <MdCheck />
    })
  }, [tables, editField])

  const onRemoveField = useCallback(async (tableIndex, fieldIndex) => {
    const field = tables[tableIndex].fields[fieldIndex];

    if (field.primarykey) {
      const tName = tables[tableIndex].name;
      const list = tables.filter(t => t.fields.some(f => f.foreignkey == tName)).map(t => t.name);
      if (list.length > 0) {
        const remove = await swal({
          title: `Remove Field`,
          text: `Are you sure you want remove '${field.name}' from Table '${tables[tableIndex].name}. ${list.length} foreign key(s) connected to this field.`,
          icon: "warning",
          buttons: {
            cancel: "Cancel",
            remove: {
              text: "Just Remove Field",
              value: "remove",
            },
            removeAll: {
              text: "Remove with Connected Tables",
              value: "removeAll",
            }
          }
        })
        if (!remove) return;

        if (remove == 'remove') {
          for (const i in tables) {
            for (const j in tables[i].fields) {
              if (tables[i].fields[j].foreignkey == tName) {
                tables[i].fields[j].foreignkey = '';
              }
            }
          }
          tables[tableIndex].fields = tables[tableIndex].fields.filter((f, i) => i != fieldIndex);
          setTables([...tables]);
        } else if (remove == 'removeAll') {
          tables[tableIndex].fields = tables[tableIndex].fields.filter((f, i) => i != fieldIndex);
          setTables(tables.filter(t => !t.fields.some(f => f.foreignkey == tName)));
        }

        return notifications.show({
          title: "Field Removed",
          message: "Field was removed",
          color: "green", position: "top-right",
          icon: <MdCheck />
        })
      }
    }

    const result = await swal({
      title: `Remove Field`,
      text: `Are you sure you want remove '${field.name}' from Table '${tables[tableIndex].name}'`,
      icon: "warning",
      buttons: ['Cancel', 'Remove']
    })
    if (!result) return;

    tables[tableIndex].fields = tables[tableIndex].fields.filter((f, i) => i != fieldIndex);
    setTables([...tables]);
  }, [tables])


  const onSelectedField = useCallback((tableIndex, fieldIndex, checked) => {
    setSelectedFieldsSet(prev => {
      if (checked) {
        prev.add(`${tableIndex}-${fieldIndex}`)
      } else {
        prev.delete(`${tableIndex}-${fieldIndex}`)
      }
      return new Set(prev);
    })
  }, [])

  const onRemoveMultipleFields = useCallback(async () => {
    let fieldsWithPrimaryKeys = 0;
    const primaryKeyTables = new Set();
    const tableMap = {}// {tableIndex: [fieldIds]}
    const setKeys = Array.from(selectedFieldsSet.values());

    for (const id of setKeys) {
      const [tableIndex, fieldIndex] = id.split('-');

      // construct map
      if (tableMap[tableIndex]) tableMap[tableIndex].push(parseInt(fieldIndex));
      else tableMap[tableIndex] = [parseInt(fieldIndex)];

      // check for primary key      
      if (tables[tableIndex].fields[fieldIndex].primarykey) {
        primaryKeyTables.add(tables[tableIndex].name)
        fieldsWithPrimaryKeys++;
      }
    }

    const tableCount = Object.keys(tableMap).length
    if (fieldsWithPrimaryKeys > 0) {
      const result = await swal({
        title: "Remove Fields",
        text: `Are you sure you want to remove ${selectedFieldsSet.size} field(s) from ${tableCount} table(s)? ${fieldsWithPrimaryKeys} field(s) with PRIMARY KEYS!`,
        icon: "warning",
        buttons: ['No', 'Yes']
      });

      if (!result) return;


      // clear all foreign keys that have references to any of the primary keys selected
      for (const i in tables) {
        for (const j in tables[i].fields) {
          if (primaryKeyTables.has(tables[i].fields[j].foreignkey)) {
            tables[i].fields[j].foreignkey = '';
          }
        }
      }

    } else {
      const result = await swal({
        title: "Remove Fields",
        text: `Are you sure you want to remove ${selectedFieldsSet.size} field(s) from ${tableCount} table(s)?`,
        icon: "warning",
        buttons: ['No', 'Yes']
      });
      if (!result) return;
    }

    const tableIndices = Object.keys(tableMap)

    for (const tableIndex of tableIndices) {
      const fieldIndices = tableMap[tableIndex];
      const fieldSet = new Set();
      for (const i of fieldIndices) fieldSet.add(i);
      tables[tableIndex].fields = tables[tableIndex].fields.filter((f, i) => !fieldSet.has(i))
    }

    setSelectedFieldsSet(new Set());
    setTables([...tables]);

    // remove fields
    notifications.show({
      title: "Fields Removed",
      message: `${selectedFieldsSet.size} field(s) removed`,
      color: "green", position: "top-right",
      icon: <MdCheck />
    })


  }, [selectedFieldsSet, tables])

  return (
    <TourProvider currentStep={currentStep} setCurrentStep={onTourStep} onClickMask={(c) => c.setIsOpen(false)} onClickClose={(c) => c.setIsOpen(false)}>
      <MantineProvider>
        <CodeHighlightAdapterProvider adapter={shikiAdapter}>
          <Notifications />

          <div className='w-full h-full'>
            <NavBar projectName={projectName} setProjectName={setProjectName} openDrawer={open} tables={tables} setTables={setTables} />

            <Drawer opened={opened} onClose={close} title={
              <div className='tour-create-table grid grid-cols-2'>
                {/* Adding Table */}
                <Input error={invalidName(tablename)} id="tablefield" placeholder='Table Name' leftSection={<Table />} maxLength={100} value={tablename} onKeyDown={(e) => { if (e.key === 'Enter') onAddTable(tablename) }} onChange={e => setTablename(e.target.value)} />
                <Button variant='filled' color='#104e64' leftSection={<Plus />} onClick={() => onAddTable(tablename)}>Add Table</Button>
              </div>
            }>
              <div className='flex flex-col gap-3 h-[90vh]'>

                {/* Search */}
                <Input.Wrapper className='tour-search-table' label="Search">
                  <Input placeholder='Search for Tables...' maxLength={100} leftSection={<SearchIcon />} radius={"md"} type='search' value={search} onChange={e => setSearch(e.target.value)} />
                </Input.Wrapper>

                {/* Multiple Select Options */}
                {selectedFieldsSet.size > 0 ? <div className='flex gap-3'>
                  <Button variant='outline' color="dark" size="xs" radius="lg" onClick={() => setSelectedFieldsSet(new Set())}>Clear All</Button>
                  <Button variant='filled' color="dark" size="xs" radius="lg" leftSection={<Trash2 size={12} />} onClick={onRemoveMultipleFields}>Remove All</Button>
                </div> : null}

                {/* Tables */}
                <div className='tour-tables flex flex-col gap-2 overflow-y-scroll min-h-4/5 bg-slate-50 p-2 rounded-2xl border-slate-100'>
                  <Accordion chevronPosition="left" variant="contained" radius="md" defaultValue="">
                    {filteredTables.map((table) =>
                      <Accordion.Item key={table.name} value={table.name}>
                        <Accordion.Control>
                          <div className='grid grid-cols-2'>
                            <div className='w-full flex items-center gap-2'>
                              <Badge color="teal" size='xs'>{table.fields.length.toString()}</Badge>
                              {table.name}
                            </div>
                            <div className='w-full gap-2 flex justify-center items-center'>

                              <Tooltip label="Table should have Timestamp?">
                                <div className={`border ${table.timestamp ? 'border-teal-500' : 'border-gray-500'} rounded-full p-1 shadow-2xs shadow-gray-400 hover:shadow-md duration-500`} onClick={() => onTableTimestamp(table.index)}>
                                  <Clock size={14} color={table.timestamp ? 'teal' : undefined} />
                                </div>
                              </Tooltip>

                              <Tooltip label={`Rename Table`}>
                                <div className={`border border-gray-500 rounded-full p-1 shadow-2xs shadow-gray-400 hover:shadow-md duration-500`} onClick={() => onRenameTable(table.index)} >
                                  <Edit2 size={14} />
                                </div>
                              </Tooltip>

                              <Tooltip label={`Remove ${table.name}`}>
                                <div className={`border border-gray-500 rounded-full p-1 shadow-2xs shadow-gray-400 hover:shadow-md duration-500`} onClick={() => onRemoveTable(table)} >
                                  <Trash2 size={14} />
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex gap-2  items-center">
                                <Input error={invalidName(tablefield.name)} onKeyDown={(e) => { if (e.key === 'Enter') onAddField(table.index, tablefield) }} id={'fieldinput-' + table.index} placeholder='Field Name' value={tablefield.name} onChange={e => setTableField({ ...tablefield, name: e.target.value })} />
                                <Select placeholder="Data Type" value={tablefield.type} onChange={(fieldtype) => setTableField({ ...tablefield, type: fieldtype })} data={FIELD_TYPES} />
                                <ActionIcon onClick={() => onAddField(table.index, tablefield)} variant='filled' color='#104e64'><Plus /></ActionIcon>
                              </div>
                              <div className="flex gap-2 items-center">

                                <Tooltip label="Primary Key">
                                  <ActionIcon onClick={() => onPrimaryKey(table.index, tablefield)} disabled={tablefield.type == 'boolean'} variant={tablefield.primarykey ? 'filled' : 'outline'} size="sm" color='orange' radius="lg">
                                    <KeyRound size={12} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Foreign Key">
                                  <ActionIcon onClick={() => onForeignKeyField(table.index, tablefield)} disabled={tablefield.type == 'boolean'} variant={tablefield.foreignkey ? 'filled' : 'outline'} size="sm" color='indigo' radius="lg">
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
                                <NumberInput allowDecimal={tablefield.type == 'float'} radius="lg" size="xs" disabled={tablefield.type == 'boolean'} placeholder='Min' value={tablefield.min} onChange={v => setTableField({ ...tablefield, min: v })} />
                                <NumberInput allowDecimal={tablefield.type == 'float'} radius="lg" size="xs" disabled={tablefield.type == 'boolean'} placeholder='Max' value={tablefield.max} onChange={v => setTableField({ ...tablefield, max: v })} />
                              </div>
                            </div>
                          </div>


                          {/* All the fields */}
                          <div className="my-3"></div>
                          <Divider />
                          <div className="my-3"></div>


                          <DndContext
                            sensors={sensors}
                            collisionDetection={rectIntersection}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={table.fields.map((f, i) => `${table.index}-${i}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              {table.fields.map((field, fieldindex) =>
                                <DataField
                                  key={`${table.index}-${fieldindex}`}
                                  dragId={`${table.index}-${fieldindex}`}
                                  field={field}
                                  dragOverlay={null}
                                  fieldindex={fieldindex}
                                  table={table}
                                  selectedFieldsSet={selectedFieldsSet}
                                  onSelectedField={onSelectedField}
                                  onEditField={() => setEditField({ ...field, index: fieldindex, tableindex: table.index })}
                                  onRemoveField={onRemoveField}
                                />
                              )}
                            </SortableContext>
                            <DragOverlay>
                              {dragId ?
                                <DataField
                                  dragOverlay={dragId != null}
                                  dragId={dragId}
                                  field={tables[dragId.split("-")[0]].fields[dragId.split("-")[1]]}
                                  fieldindex={dragId.split("-")[1]}
                                  table={table}
                                  selectedFieldsSet={new Set()}
                                  onSelectedField={() => null}
                                  onEditField={() => null}
                                  onRemoveField={() => null}
                                />
                                : null
                              }
                            </DragOverlay>
                          </DndContext>
                          {/* Show Time Stamps */}
                          {table.timestamp ? ["createdAt", "updatedAt"].map((name, i) =>
                            <DataField
                              key={table.name + "timestamp" + i}
                              field={{ name: name, type: "DateAndTime", foreignkey: "", primary: false, max: "", min: "", autoincrement: false }}
                              isTimestamp={true}
                              dragId={null}
                              dragOverlay={null}
                              fieldindex={-1}
                              selectedFieldsSet={new Set()}
                              table={table}
                            />
                          ) : null}
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

            </main>


            {/* Modals */}
            {
              editField ?
                <Modal opened={editField != null} onClose={() => setEditField(null)} title="Edit Field">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input.Wrapper label="Field Name">
                        <Input error={invalidName(editField.name)} placeholder='Field Name' label='Field Name' value={editField.name} onChange={e => setEditField({ ...editField, name: e.target.value })} />
                      </Input.Wrapper>
                      <Select placeholder="Data Type" label="Data Type" value={editField.type} onChange={(fieldtype) => setEditField({ ...editField, type: fieldtype })} data={FIELD_TYPES} />
                    </div>

                    <div className="flex gap-2 my-2">
                      <NumberInput allowDecimal={editField.type == 'float'} label="Min" disabled={editField.type == 'boolean'} placeholder='Min' value={editField.min} onChange={v => setEditField({ ...editField, min: v })} />
                      <NumberInput allowDecimal={editField.type == 'float'} label="Max" disabled={editField.type == 'boolean'} placeholder='Max' value={editField.max} onChange={v => setEditField({ ...editField, max: v })} />
                    </div>


                    <div className="flex gap-4 my-2">
                      <Switch
                        disabled={editField.type == 'boolean'}
                        checked={editField.primarykey}
                        onChange={(event) => setEditField({ ...editField, primarykey: event.currentTarget.checked })}
                        color="orange"
                        label="Primary Key"
                        size="sm"
                      />
                      <Switch
                        disabled={editField.type == 'boolean'}
                        checked={editField.unique}
                        onChange={(event) => setEditField({ ...editField, unique: event.currentTarget.checked })}
                        color="grape"
                        label="Unique"
                        size="sm"
                      />
                      <Switch
                        disabled={editField.type == 'boolean'}
                        checked={editField.autoincrement}
                        onChange={(event) => setEditField({ ...editField, autoincrement: event.currentTarget.checked })}
                        color="pink"
                        label="Auto Increment"
                        size="sm"
                      />
                    </div>

                    <Select
                      placeholder="Foreign Key to Table"
                      label="Foreign Key"
                      description="Select the table to connect to"
                      value={editField.foreignkey}
                      onChange={(key) => setEditField({ ...editField, foreignkey: key })}
                      data={foreignKeyOptions}
                    />

                    {tables[editField.tableindex].fields[editField.index].primarykey && !editField.primarykey ?
                      <Alert variant="light" color="orange" title="Disabling Primary Key" icon={<MdWarning />}>
                        Disabling the primary key will disconnect all the tables connected to this field
                      </Alert>
                      : null}

                    <Button variant="filled" color="teal" leftSection={<EditIcon />} onClick={onEditField}>Update Field</Button>

                  </div>
                </Modal>
                : null
            }

            {/* Select Table when choose foreign key for field */}
            <Modal opened={tableListOfForeignKeys.length > 0} onClose={() => setForeignKeyOptions([])} title="Edit Field">
              <div className="flex flex-col gap-3">
                <Select
                  placeholder="Foreign Key to Table"
                  label="Foreign Key"
                  description="Select the table to connect to"
                  value={foreignkeySelected}
                  onChange={(key) => setForeignkeySelected(key)}
                  data={tableListOfForeignKeys}
                />
                <Button variant="filled" color="teal" leftSection={<EditIcon />} onClick={() => { setTableField({ ...tablefield, foreignkey: foreignkeySelected }); setForeignKeyOptions([]) }}>Set Foreign Key</Button>
              </div>
            </Modal>

            {/* Select Table when choose foreign key for drawflow node connection */}
            {nodeForeignKeyEditDialgoue ? <Modal opened={nodeForeignKeyEditDialgoue != null} onClose={() => { setNodeForeignKeyEditDialogue(null); setTables(prev => [...prev]) }} title="Choose Field to Connect to Table">
              <div className="flex flex-col gap-3">
                <Select
                  placeholder="Foreign Key to Table"
                  label="Foreign Key"
                  description="Select the table to connect to"
                  value={foreignkeySelected}
                  onChange={(key) => setForeignkeySelected(key)}
                  data={nodeForeignKeyEditDialgoue.fields.map(f => f.name)}
                />
                <Button variant="filled" color="teal" leftSection={<EditIcon />} onClick={() => {
                  setTables(prev => {
                    if (foreignkeySelected) {
                      const { tableIndex, tableToConnect: tablename } = nodeForeignKeyEditDialgoue;
                      const fields = prev[tableIndex].fields
                      const fieldIndex = fields.findIndex(f => f.name == foreignkeySelected);
                      prev[tableIndex].fields[fieldIndex].foreignkey = tablename;
                    }
                    return [...prev];
                  })
                  if (foreignkeySelected) {
                    notifications.show({
                      title: "Tables connected",
                      message: `Connected tables succesfully`,
                      color: "green", position: "top-right",
                      icon: <MdCheck />
                    });
                  }
                  setForeignkeySelected("");
                  setNodeForeignKeyEditDialogue(null);
                }}>Set Foreign Key</Button>
              </div>
            </Modal> : null}


            <FirstTime />


            <footer className='w-full h-8 fixed bottom-0 left-0 bg-gray-700 flex flex-col p-2 justify-center items-start  z-10'>
              <div className="flex w-full items-center">
                <p className='text-xs text-white text-start px-4 w-full'>Data Frame</p>
                <div className='w-full'></div>
                <div className='tour-zoom flex gap-2 justify-end items-center  px-4'>
                  <Tooltip label="Zoom in">
                    <ActionIcon size={"sm"} radius={"lg"} color='white' variant='outline' onClick={() => drawflowEditor?.zoom_in()}>
                      <ZoomInIcon size={15} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Zoom out">
                    <ActionIcon size={"sm"} radius="lg" color='white' variant='outline' onClick={() => drawflowEditor?.zoom_out()}>
                      <ZoomOutIcon size={15} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Zoom reset">
                    <ActionIcon size={"sm"} radius="lg" color='white' variant='outline' onClick={() => drawflowEditor?.zoom_reset()}>
                      <Maximize2Icon size={15} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Zoom refresh">
                    <ActionIcon size={"sm"} radius="lg" color='white' variant='outline' onClick={() => drawflowEditor?.zoom_refresh()}>
                      <RefreshCw size={15} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
            </footer>

          </div >

        </CodeHighlightAdapterProvider>
      </MantineProvider>
    </TourProvider>
  )
}

export default App