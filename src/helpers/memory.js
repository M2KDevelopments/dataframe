

export function saveProject(projectname, tables) {
    return window.localStorage.setItem('dataframe', JSON.stringify({ name: projectname, tables }))
}

export function getProject() {
    const data = window.localStorage.getItem('dataframe');
    if (!data) return { name: window.localStorage.getItem('project') || "DataFrame", tables: [] }
    return JSON.parse(data);
}