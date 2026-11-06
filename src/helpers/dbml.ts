const text = `
  Table learner_attendance_rows{
    id uuid [pk]
    learner_attendance_submission_id uuid [not null]
    learner_id uuid [not null]
    attendance_days int [not null, default: 0]
    created_at timestamp [default: \`now()\`]
  }

  Table teacher_observations_learner_attendance_assignments {
    id uuid [pk]
    teacher_observation_submissions_id uuid [unique, not null]
    learner_attendance_id uuid [unique, not null]
    created_at timestamp [default: \`now()\`]
    updated_at timestamp
  }

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


export function parser(dbml = "") {
  if (!dbml) return [];

  const table_data_list = dbml.replace(/table/gmi, 'Table').split("Table")
  for (const table_data of table_data_list) {

    // remove unnecessary symbols
    const data_fields = table_data.replace("{", "").replace("}", "").trim().split("\n");

    let table_name = "";
    const fields = [];

    for (const field_index in data_fields) {
      const field = data_fields[field_index];

      // first line is a name
      if (field_index == 0) {
        table_name = field.trim();
      } else {
        // get field name and data type
        const [field_name, field_type] = field.trim().replace(/\s/gmi, " ").split(" ");

        // if there are any [] brackets for field attributes
        if (!(field.includes("[") && field.includes("]"))) {
          continue;
        }

        // get brackets indices
        const start_bracket_index = field.indexOf("[");
        const end_bracket_index = field.indexOf("]");

        // syntax check
        if (start_bracket_index >= end_bracket_index) {
          continue;
        }

        //get attributes
        const attributes = field.toLowerCase()
          .substring(start_bracket_index, end_bracket_index + 1)
          .replace("[", "")
          .replace("]", "")
          .split(",");


        for (const attr of attributes) {
          if (attr.includes("default")) {
            // Examples
            //  status varchar(20) [default: 'active'] // Default Value
            // created_at timestamp [default: now()] // Default Expression
            const value = attr.replaceAll("'", "").replaceAll('"', "").replaceAll('`', "").replace('default', "").replaceAll(":", "").trim();
            if (value === 'now()' && field_type == 'timestamp') {
              //
            } else {
              //
            }
          } else if (attr.includes("note")) {
            // const value = attr.replaceAll("'", "").replaceAll('"', "").replaceAll('`', "").replace('default', "").replaceAll(":", "").trim();
             // console.log(field_name, value)
            // Example
            // rating integer [note: 'User rating score'] // Note/Comment
          } else if (attr.includes("type")){
            // Example
            // booking_date [type: hash] // Hash Index
          } else if (attr.includes("not null")) {
            // Examples
            // id integer [pk, not null] // Primary Key, Not Null
          } else if (attr.includes("pk")) {
            // Examples
            // id integer [pk, not null] // Primary Key, Not Null
          } else if (attr.includes("unique")) {
            // Examples
            // id integer [unique] // Primary Key, Not Null
          } else if (attr.includes("ref")) {
            // Examples
            // user_id int [ref: > users.id] // many-to-one
            // // user_id int [ref: < users.id] // one-to-many
            // user_id int [ref: - users.id] // one-to-one
          }
        }
      }
    }

  }

}


parser(text);
