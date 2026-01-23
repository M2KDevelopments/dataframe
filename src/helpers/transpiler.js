import FIELD_TYPES from '../assets/datatypes.json';
import ORM_DATA_TYPES from '../assets/orm.datatypes.json';

const mapFieldTypes = new Map();
for (const f of FIELD_TYPES) mapFieldTypes.set(f.value, f.label);
const sqlKeywords = [
    "ADD",
    "ALTER",
    "AND",
    "ANY",
    "AS",
    "ASC",
    "BACKUP",
    "BETWEEN",
    "CASE",
    "CHECK",
    "COLUMN",
    "CONSTRAINT",
    "UNIQUE",
    "CREATE",
    "REPLACE",
    "PROCEDURE",
    "REPLACE",
    "DATABASE",
    "DEFAULT",
    "DELETE",
    "DESC",
    "DISTINCT",
    "DROP",
    "VIEW",
    "EXEC",
    "EXISTS",
    "FROM",
    "GROUP",
    "HAVING",
    "IN",
    "INDEX",
    "INNER",
    "INCREMENT",
    "AUTO_INCREMENT",
    "INTO",
    "NULL",
    "JOIN",
    "LIKE",
    "LIMIT",
    "NOT",
    "OR",
    "ORDER",
    "OUTER",
    "PRIMARY",
    "KEY",
    "PROCEDURE",
    "RIGHT",
    "LEFT",
    "ROWNUM",
    "SELECT",
    "SET",
    "TABLE",
    "TOP",
    "UNION",
    "UNIQUE",
    "UPDATE",
    "VALUES",
    "VIEW",
    "WHERE"
]


export function getSQLFrom(tables) {
    const map = new Map();
    for (const t of tables) map.set(t.name, t);
    return tables.map(table => {
        let name = table.name;
        if (sqlKeywords.includes(name.toUpperCase())) name = `\`${name}\``;
        return `CREATE ${name} IF NOT EXISTS (\n${table.fields
            .map(field => {
                let fieldname = field.name;
                let attributes = "";
                if (sqlKeywords.includes(fieldname.toUpperCase())) fieldname = `\`${fieldname}\``;
                if (field.primarykey) attributes + " PRIMARY KEY";
                if (field.unique) attributes + " UNIQUE NOT NULL";
                if (field.autoincrement) attributes + " AUTO_INCREMENT";
                if (field.foreignkey) {
                    const primaryTable = map.get(field.foreignkey)
                    const primaryKey = primaryTable ? primaryTable.fields.find(f => f.primarykey) : "";
                    const primary_key = primaryKey?.name || `<primary_key_not_found>`;
                    return (
                        `\t${fieldname} ${ORM_DATA_TYPES.sql[field.type]}${attributes}\n`
                        +
                        `\tCONSTRAINT FK_${field.foreignkey}${table.name} FOREIGN KEY (${primary_key})\n\tREFERENCES ${field.foreignkey}(${primary_key})`
                    )
                }
                return `\t${fieldname} ${ORM_DATA_TYPES.sql[field.type]}${attributes}`
            })
            .join(`\n`)}
            ${table.timestamp ? (`\n\tcreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`) : ""}\n)`
    }).join("\n\n");
}

export function getPrismaFrom(tables) {
    const map = new Map();
    for (const t of tables) map.set(t.name, t);
    return tables.map(table => {
        let name = table.name;
        return `model ${name} {\n${table.fields
            .map(field => {
                let fieldname = field.name;
                let attributes = "";
                if (field.primarykey) attributes + " @id";
                if (field.unique) attributes + " @unique";
                if (field.autoincrement) attributes + " @default(autoincrement())";

                // e.g  taggedContact Contact  @relation(fields: [contact], references: [id])
                if (field.foreignkey) {
                    const primaryTable = map.get(field.foreignkey)
                    const primaryKey = primaryTable ? primaryTable.fields.find(f => f.primarykey) : "";
                    const primary_key = primaryKey?.name || `<primary_key_not_found>`;
                    return (
                        `\t${fieldname} ${ORM_DATA_TYPES.prisma[field.type]}${attributes}\n`
                        +
                        `\t${fieldname}${field.foreignkey} ${field.foreignkey} @relation(fields: [${fieldname}], references: [${primary_key}])`
                    )
                }

                return `\t${fieldname} ${ORM_DATA_TYPES.prisma[field.type]}${attributes}`
            }).join(`\n`)}${table.timestamp ? (
                `\n\t//timestamps` +
                `\n\tcreatedAt DateTime @default(now())` +
                `\n\tupdatedAt DateTime @updatedAt`) : ""}\n}`
    }).join("\n\n");
}

export function getDrizzleFrom(tables) {
    return `import { integer, pgTable, text } from "drizzle-orm/pg-core";\n` +
        `import { sql } from "drizzle-orm";\n\n` +
        tables.map(table => {
            return `export const ${table.name}WithIdentity = pgTable("${table.name}", {\n${table.fields
                .map(field => {
                    let fieldname = field.name;
                    let attributes = "";
                    if (field.primarykey) attributes + ".primaryKey()";
                    if (field.unique) attributes + ".unique().notNull()";
                    if (field.autoincrement) attributes + ".autoincrement()";
                    return `\t${fieldname}: ${ORM_DATA_TYPES.drizzle[field.type]}("${fieldname}")${attributes},`
                })
                .join(`\n`)}
                ${table.timestamp ? (
                    `\n\t//timestamps` +
                    `\n\tcreatedAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),` +
                    `\n\tupdatedAt: timestamp('updated_at', { mode: 'date' }).notNull().default(sql\`now()\`)`) : ""}\n});`
        }).join("\n\n");
}

export function getMongoose(tables) {
    return `const mongoose = require('mongoose');\n` +
        `const Schema = mongoose.Schema;` +
        `` +
        tables.map(table => {
            return `const ${table.name}Schema = new Schema({\n${table.fields
                .map(field => {
                    let fieldname = field.name;
                    let attributes = "";
                    if (field.primarykey) attributes + ".primaryKey()";
                    if (field.unique) attributes + ".unique().notNull()";
                    if (field.autoincrement) attributes + ".autoincrement()";
                    return `\t${fieldname}: {` +
                        (`\n\t\t` + `type: ${ORM_DATA_TYPES.mongo[field.type]},`) +
                        (`${field.min ? `\n\t\tmin: ${field.min},` : ""}`) +
                        (`${field.max ? `\n\t\tmax: ${field.max},` : ""}`) +
                        (`${field.unique ? `\n\t\tmax: ${field.unique},` : ""}`) +
                        (`${field.primarykey || field.foreignkey ? `\n\t\trequired: true,` : ""}`) +
                        (`${field.foreignkey ? `\n\t\tref: '${field.foreignkey}',` : ""}`) +
                        `\n\t},` +
                        ``;
                })
                .join(`\n`)}\n}${table.timestamp ? `,{\n\ttimestamps: true // Enable timestamps\n}` : ""});`
        }).join("\n\n");
}