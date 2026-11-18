const text = `
  Table "learner_attendance_rows" {
    id uuid [pk]
    learner_attendance_submission_id uuid [not null]
    learner_id uuid [not null]
    attendance_days int [not null, default: 0]
    created_at timestamp [default: \`now()\`]
  }

  Enum month_enum {
  JANUARY
  FE/*BRUA*/RY
  MARCH
  //APRIL
  MAY
  JUNE
  //JULY
  AUGUST
  SEPTEMBER
  OCTOBER
  //NOVEMBER
  DECEMBER
}


  Table teacher_observations_learner_attendance_assignments {
    id uuid [pk]
    teacher_observation_submissions_id uuid [unique, not null]
    learner_attendance_id uuid [unique, not null]
    created_at timestamp [default: \`now()\`]
    updated_at timestamp
  }

  TableGroup "Core Entity" [color: #8e44ad] {
  users
  learners
  teachers
  schools
  classes
}

  /*
  TABLE GROUPS
  - core entity
  - form submission
  - submission child/repeater row
  - assignment/history table
  - lookup / controlled vocabulary
  - workflow/tool table
  - system metadata
*/

// Dropdown relationships  
Ref: syncs.assigned_user_id > users.id // many-to-one
Ref: syncs.changed_by_id > users.id // many-to-one


  Table spot_check_learner_attendance_assignments {
    id uuid [pk]
    spot_check_submissions_id uuid [unique, not null]
    learner_attendance_id uuid [unique, not null]
    created_at timestamp [default: \`now()\`]
    updated_at timestamp
  }

  Table groups {
    id uuid [pk]
    name varchar [unique, not null]
    description varchar [not null, default: ""]

    active boolean [not null, default: true]
    from_legacy boolean [not null, default: false]

    current_phase group_phase_enum [not null]

    country_id uuid [not null]
    region_id uuid [not null]
    district_id uuid [not null]

    updated_at timestamp
    created_at timestamp [default: \`now()\`]
  }

  Table group_active_history {
    id uuid [pk]
    active boolean [not null]
    date timestamp [not null]
    group_id uuid [not null]
    created_by uuid [not null]
    created_at timestamp [default: \`now()\`]
    reason varchar [not null, default: ""]
  }


  Table teacher_group_assignments {
    id uuid [pk]
    teacher_id uuid [not null]
    group_id uuid [not null]
    from_date timestamp [not null]
    to_date timestamp
    is_current boolean [not null, default: true]
    created_by uuid [not null]
    created_at timestamp [default: \`now()\`]
  }

  `;

const numbers_set = new Set<string>(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const alphanumeric_set = new Set<string>(["_", "'", '"', "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]);
const keywords = [
	'tablegroup',
	'table',
	'enum'
] as const;


interface Field {
	name: string,
	type: string,
	note?: string,
	default?: string,
	not_null?: boolean,
	pk?: boolean,
	unique?: boolean,
	ref?: string
}

interface ITable {
	name: string,
	fields: Field[]
}

interface IEnum {
	name: string,
	values: string[]
}

interface ITableGroup {
	name: string,
	color?: string,
	values: string[]
}
interface EntityData {
	name: string,
	fields: string,
}


function isKeywordDetected(props: { index: number, text: string, keyword: string }) {
	const { index, text, keyword } = props;
	for (let i = 0; i < keyword.length; i++) {
		if (text[index + i].toLowerCase() != keyword[i].toLowerCase()) {
			return false;
		}
	}
	return true;
}

function isNameValid(name: string) {
	// Entity has no name
	if (name.length == 0) {
		return false;
	}

	// Alphanumeric names for table/models
	if (numbers_set.has(name[0]) || !alphanumeric_set.has(name[0])) {
		return false;
	}

	for (let i in name.split("")) {
		if (!(alphanumeric_set.has(name[i]) || numbers_set.has(name[i]))) {
			console.log(name[i])
			return false;
		}
	}

	return true;
}

function removeComments(dbml: string) {
	let code = "";
	let is_code_in_block_comment = false
	let is_code_in_singleline_comment = false

	// bool flag to check if code is in comments
	let is_code_in_comments = is_code_in_block_comment || is_code_in_singleline_comment

	for (let i = 0; i < dbml.length; i++) {

		if (is_code_in_comments == false && i < dbml.length - 1) {

			// current and next char == "//" or "/*"
			if (dbml[i] == '/' && dbml[i + 1] == '/') {
				is_code_in_singleline_comment = true;
			} else if (dbml[i] == '/' && dbml[i + 1] == '*') {
				is_code_in_block_comment = true;
			}
		} else if (is_code_in_block_comment == true && i < dbml.length - 1) {

			if (dbml[i] == '*' && dbml[i + 1] == '/') {
				is_code_in_block_comment = false;
				i += 2;
			}
		} else if (is_code_in_singleline_comment == true && i < dbml.length) {
			if (dbml[i] == '\n') {
				is_code_in_singleline_comment = false;
				i += 1;
			}
		}

		//flag to check if code is in comments
		is_code_in_comments = is_code_in_block_comment || is_code_in_singleline_comment

		// if code is not commented
		if (is_code_in_comments == false) {
			code += dbml[i]
		}
	}

	return code;
}

function parseEntities(dbml: string) {

	let active_keyword = "";
	let name_of_entity = "";
	let field_text = "";

	const entities: { [key: string]: EntityData[] } = {};
	for (const key of keywords) entities[key] = [] as EntityData[];

	for (let i = 0; i < dbml.length; i++) {

		// already inside scope of entity
		if (!active_keyword) {
			for (const keyword of keywords) {
				const is_keyword_detected = isKeywordDetected({
					index: i,
					keyword: keyword,
					text: dbml
				});

				if (is_keyword_detected) {

					// skip to non-space character next
					i += keyword.length;

					// Get name
					const index_of_open_brace = dbml.indexOf("{", i);

					// Entity has no name
					if (index_of_open_brace == -1) {
						throw new Error("DBML parsing error: No opening brace found for keyword " + keyword);
					}

					name_of_entity = dbml.substring(i, index_of_open_brace).trim();

					// Entity has no name
					if (name_of_entity.length == 0) {
						throw new Error(`${keyword} has no name`);
					}

					// Alphanumeric names for table/models
					if (numbers_set.has(name_of_entity[0]) || !alphanumeric_set.has(name_of_entity[0])) {
						throw new Error(`${keyword} need to start with an alphabet or underscores to: ${name_of_entity}`);
					}

					// Valid entity name
					if (!isNameValid(name_of_entity)) {
						if (name_of_entity.includes("color") && name_of_entity.includes("[")) {
							// enitity has color e.g "Core Entity" [color: #8e44ad]
						} else {
							throw new Error(`${keyword} needs to be a valid name: ${name_of_entity}`);
						}
					}

					// start at the position after open brace
					i = index_of_open_brace + 1;
					active_keyword = keyword;
					break;
				}
			}

			if (name_of_entity) continue;
		}

		// next character 
		if (!active_keyword) continue;

		if (dbml[i] == "}") { // when scope closes
			entities[active_keyword].push({
				name: name_of_entity,
				fields: field_text
			});
			field_text = "";
			name_of_entity = "";
			active_keyword = "";
		} else {
			field_text += dbml[i];
		}

	}

	return entities;
}

export function parseDBML(dbml = "") {
	if (!dbml) return [];

	// remove comments
	const code = removeComments(dbml);
	const entities = parseEntities(code);
	const tables: ITable[] = [];
	const table_groups: ITableGroup[] = [];
	const enums: IEnum[] = entities['enum'].map(e => ({
		name: e.name.replaceAll('"', "").trim(),
		values: e.fields.split("\n").map(str => str.trim())
	}))

	// Parse Table Groups
	for (const group of entities['tablegroup']) {
		let { name, fields } = group;
		const list = [];
		let color: string | undefined;

		for (const f of fields) list.push(f.trim());

		if (name.includes("color") && name.includes("]")) {
			const start = name.indexOf(":") + 1
			const end = name.indexOf("]");
			color = name.substring(start, end);
			name = name.substring(0, name.indexOf("["))
		}

		table_groups.push({
			name: name.replaceAll('"', "").trim(),
			values: list,
			color: color
		})

	}

	// Parse Tables/Models
	for (const table_data of entities["table"]) {

		// remove unnecessary symbols
		const data_fields = table_data.fields.split("\n");


		const table: ITable = {
			name: table_data.name.replaceAll('"', ""),
			fields: []
		}

		for (const field_index in data_fields) {
			const data_field = data_fields[field_index];

			// get field name and data type
			const [field_name, field_type] = data_field.trim().replace(/\s/gmi, " ").split(" ");

			// if there are any [] brackets for field attributes
			if (!(data_field.includes("[") && data_field.includes("]"))) {
				continue;
			}

			const field: Field = {
				name: field_name,
				type: field_type
			}

			// get brackets indices
			const start_bracket_index = data_field.indexOf("[");
			const end_bracket_index = data_field.indexOf("]");

			// syntax check
			if (start_bracket_index >= end_bracket_index) {
				continue;
			}

			//get attributes
			const attributes = data_field.toLowerCase()
				.substring(start_bracket_index, end_bracket_index + 1)
				.replace("[", "")
				.replace("]", "")
				.split(",");


			for (const attr of attributes) {
				if (attr.includes("default")) {
					// Examples
					// status varchar(20) [default: 'active'] // Default Value
					// created_at timestamp [default: now()] // Default Expression
					const value = attr.replaceAll("'", "").replaceAll('"', "").replaceAll('`', "").replace('default', "").replaceAll(":", "").trim();
					if (value === 'now()' && field_type == 'timestamp') {
						//
					} else {
						field.default = value;
					}
				} else if (attr.includes("note")) {
					// console.log(field_name, value)
					// Example
					// rating integer [note: 'User rating score'] // Note/Comment
					const value = attr.replaceAll("'", "").replaceAll('"', "").replaceAll('`', "").replace('note', "").replaceAll(":", "").trim();
					field.note = value;
				} else if (attr.includes("type")) {
					// Example
					// booking_date [type: hash] // Hash Index
					const value = attr.replaceAll("'", "").replaceAll('"', "").replaceAll('`', "").replace('type', "").replaceAll(":", "").trim();
					field.type = value;
				} else if (attr.includes("not null")) {
					// Examples
					// id integer [pk, not null] // Primary Key, Not Null
					field.not_null = true;
				} else if (attr.includes("pk")) {
					// Examples
					// id integer [pk, not null] // Primary Key, Not Null
					field.pk = true;
				} else if (attr.includes("unique")) {
					// Examples
					// id integer [unique] // Primary Key, Not Null
					field.unique = true;
				} else if (attr.includes("ref")) {
					// Examples
					// user_id int [ref: > users.id] // many-to-one
					// // user_id int [ref: < users.id] // one-to-many
					// user_id int [ref: - users.id] // one-to-one

				}
			}

			table.fields.push(field);
		}


		//add table to list
		if (table.name) tables.push(table);
	}

	return {
		enums, table_groups, tables
	}
}

console.log(parseDBML(text));