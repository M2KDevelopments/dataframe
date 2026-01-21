export function saveProject(projectname, tables) {
    return window.localStorage.setItem('dataframe', JSON.stringify({ name: projectname, tables }))
}

export function getProject() {
    const data = window.localStorage.getItem('dataframe');
    if (!data) return { name: "DataFrame", tables: [] }
    return JSON.parse(data);
}