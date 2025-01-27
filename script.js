// one step consists in:
// evaluate connections
// evaluate logic gates state

const cellEdge = 50
let tableHeight = Math.floor(window.innerHeight / cellEdge)
let tableWidth = Math.floor(window.innerWidth / cellEdge)

const container = document.getElementById("container")
const shadowTable = document.getElementById("shadowTable")
const svg = document.getElementById("svg")
const STsvg = document.getElementById("STsvg")
const menu = document.getElementById("menu")
const speed = document.getElementById("speed")
const copyMenu = document.getElementById("copyMenu")

const connections = []
const gates = []

// Main simulation stuff  ------------------------------------------------

function simulateStep(){
    connections.forEach((connection) => connection.evalState())
    gates.forEach((gate) => gate.evalState())
}

simulation = null
function setSpeed(){
    if (simulation) clearInterval(simulation)
    if (speed.value > 0){
        simulation = setInterval(simulateStep, 1000/speed.value)
    }
}
setSpeed()

class LogicGate{
    constructor(evalState, element, maxConnection=2, type="gate"){
        this.inputs = []  // states of the inputs
        for (let i = 0; i < maxConnection; i++) {
            this.inputs.push(-1)  // -1 means that the pin is free
        }
        this.state = false  // internal state of the gate (used by evalOutput)
        this.evalState = evalState  // evaluate state with inputs
        this.element = element  // HTML element to update the color
        this.type = type  // Gate or Button
        this.outConnections = []  // reference to all the connection going outwards
        this.inConnections = []  // reference to all the connection going inwords
    }
}

class Connection{
    constructor(start, end, endPin, element){
        this.start = start  // logic gate at wich it's connected as start
        this.end = end  // logic gate at wich it's connected as end
        this.endPin = endPin  // at wich pin it's connected to (ether 0 or 1)
        this.element = element  // HTML element to update the color
    }

    evalState(){
        this.end.inputs[this.endPin] = this.start.state  // set the end pin to start state
        this.element.setAttribute("stroke", this.start.state ? "red" : "white")
    }
    createElement(){
        const connEmt = document.createElementNS("http://www.w3.org/2000/svg", "line")
        connEmt.setAttribute("stroke", "white")
        const rect1 = this.start.element.getBoundingClientRect();
        connEmt.setAttribute("x1", rect1.left + (rect1.width / 2))
        connEmt.setAttribute("y1", rect1.top + (rect1.height / 2))

        const rect2 = this.end.element.getBoundingClientRect();
        connEmt.setAttribute("x2", rect2.left + (rect2.width / 2))
        connEmt.setAttribute("y2", rect2.top + (rect2.height / 2))
        this.element = connEmt
        return connEmt
    }
}

// Evaluation functions of different logic gates  ------------------------

function toNat(a){
    return Math.max(a, 0)
}

function AndGate(){
    this.state = (toNat(this.inputs[0]) && toNat(this.inputs[1]))
    this.element.style.backgroundColor = this.state ? "red" : ""
}

function OrGate(){
    this.state = (toNat(this.inputs[0]) || toNat(this.inputs[1]))
    this.element.style.backgroundColor = this.state ? "green" : ""
}

function XorGate(){
    this.state = (toNat(this.inputs[0]) ^ toNat(this.inputs[1]))
    this.element.style.backgroundColor = this.state ? "blue" : ""
}

function NorGate(){
    this.state = !(toNat(this.inputs[0]) || toNat(this.inputs[1]))
    this.element.style.backgroundColor = this.state ? "magenta" : ""
}

function Led(){
    this.state = false
    for (let i = 0; i < this.inputs.length; i++) {
        if(toNat(this.inputs[i])){
            this.state = true
            break
        }
    }
    this.element.style.backgroundColor = this.state ? "yellow" : ""
}

// Creating the simulation grid  -----------------------------------------

for (let y = 0; y < tableHeight; y++) {
    let row = document.createElement("tr");
    for (let x = 0; x < tableWidth; x++) {
        const cell = document.createElement("td")
        cell.style.width = cellEdge + "px"
        cell.style.height = cellEdge + "px"
        row.appendChild(cell);
    }
    container.appendChild(row);
}


// Handling interaction  -------------------------------------------------

function createGate(e){
    if (e.target.dataset.isGate) return 0
    switch (menu.value) {
        case "And":
            newGate = new LogicGate(AndGate, e.target)
            break
        case "Or":
            newGate = new LogicGate(OrGate, e.target)
            break
        case "Xor":
            newGate = new LogicGate(XorGate, e.target)
            break
        case "Nor":
            newGate = new LogicGate(NorGate, e.target)
            break
        case "Led":
            newGate = new LogicGate(Led, e.target, 20)
            break
        case "Btn":
            newGate = new LogicGate(function(){}, e.target, 0, "button")
            break
        default:
            return 0
    }

    gates.push(newGate)
    e.target.dataset.gateId = gates.length-1
    e.target.dataset.isGate = true
    e.target.innerText = menu.value
    return 1
}

function deleteGate(cell){    
    if (!cell.dataset.isGate) return
    const gateIndex = cell.dataset.gateId
    const gate = gates[gateIndex]

    // Removing connections to gate  ------------

    // Removing connection and HTML element of the connection
    for (let i = 0; i < gate.outConnections.length; i++) {  // outwards connections
        const c = gate.outConnections[i]
        Cindex = connections.indexOf(c)
        lineElement = c.element
        svg.removeChild(lineElement)
        connections.splice(Cindex, 1)  // removing from connections list
        Cindex = c.end.inConnections.indexOf(c)
        c.end.inConnections.splice(Cindex, 1)  // removing input connection from output gate inConnection list
    }
    
    for (let i = 0; i < gate.inConnections.length; i++) {  // inwords connections
        const c = gate.inConnections[i]
        Cindex = connections.indexOf(c)
        lineElement = c.element
        svg.removeChild(lineElement)
        connections.splice(Cindex, 1)  // removing from connections list
        Cindex = c.start.outConnections.indexOf(c)
        c.start.outConnections.splice(Cindex, 1)  // removing output connection from input gate outConnection list
    }

    // Deleting the connection output gate input 'cause that connection ain't connection anymore
    for (let i = 0; i < gate.outConnections.length; i++) {
        const c = gate.outConnections[i]
        c.end.inputs[c.endPin] = -1  // delete the connection at the end pin
    }

    // Removing gate
    gates.splice(gateIndex, 1);
    for (let offset = gateIndex; offset < gates.length; offset++) {
        gates[offset].element.dataset.gateId--
    }
    deleteCell(cell)
}

function deleteCell(cell){
    cell.innerText = ""
    cell.dataset.isGate = ""
    cell.dataset.gateId = ""
    cell.style.backgroundColor = "#333333"
}

function pushButton(e){
    if (!e.target.dataset.isGate) return 0
    const gate = gates[e.target.dataset.gateId]
    if (gate.type != "button") return 0
    gate.state = !gate.state
    e.target.style.backgroundColor = gate.state ? "red" : "#333333"
}


// Handling clicksss (and other mouse events)  ---------------------------

let line = null
let selRect = null
let startCell = null
let deleteMode = false
let moveShadowMode = false

container.addEventListener("contextmenu", (e) => {e.preventDefault();});

container.addEventListener("mousedown", function(e){
    if (e.button != 0){  // Left click
        deleteMode = true
        deleteGate(e.target)
        return
    }

    if (e.button == 0 && e.shiftKey) {
        initSelection(e)
        return
    }

    startCell = e.target
    if (menu.value == "Sel"){
        initSelection(e)
        return
    }
    if (initConnection(e)) return
})

document.addEventListener("mousedown", function(e){
    if (moveShadowMode) placeSelection(e)
    if (Array.from(copyMenu.children).indexOf(e.target) == -1) cancelSelection()
})


container.addEventListener("mouseup", function(e){
    deleteMode = false
    if (e.target == startCell && e.button == 0){
        if (createGate(e)) { deploySelection(e); return }
        if (pushButton(e)) return
    }
    if (deployConnection(e)) return
    if (deploySelection(e)) return
})

container.addEventListener("mousemove", function(e){
    if (deleteMode){ deleteGate(e.target); return }
    if (line){ moveLine(e); return }
    if (selRect){ moveSelection(e); return }
})

document.addEventListener("mousemove", function(e){
    if (moveShadowMode) moveShadowTable(e)
})

container.addEventListener("mouseleave", function(e){
    if (line){
        svg.removeChild(svg.lastElementChild)
        line = null
        startCell = null
        deleteMode = false
    }
    if (selRect){
        svg.removeChild(selRect)
        selRect = null
    }
})


// Handling the connection creation  -------------------------------------

function initConnection(e){
    if (!e.target.dataset.isGate) return 0
    line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    const rect = e.target.getBoundingClientRect();
    line.setAttribute("x1", rect.left + rect.width / 2)
    line.setAttribute("y1", rect.top + rect.height / 2)
    line.setAttribute("x2", rect.left + rect.width / 2)
    line.setAttribute("y2", rect.top + rect.height / 2)
    line.setAttribute("stroke", "white")
    svg.appendChild(line);
    return 1
}

function findFreePin(gate){
    for (let i = 0; i < gate.inputs.length; i++) {
        if (gate.inputs[i] == -1){
            return i
        }
    }
    return -1
}

function deployConnection(e){
    if (!line) return 0
    const endGate = gates[e.target.dataset.gateId]

    if (!e.target.dataset.isGate || e.target == startCell || findFreePin(endGate) == -1){
        svg.removeChild(svg.lastElementChild)
        line = null
        startCell = null
        return 0
    }

    // the connection is confirmed
    pin = findFreePin(endGate)

    const rect = e.target.getBoundingClientRect()
    line.setAttribute("x2", rect.left + rect.width / 2)
    line.setAttribute("y2", rect.top + rect.height / 2)

    // add the connection object
    startGate = gates[startCell.dataset.gateId]
    const newConnection = new Connection(
        start = startGate,
        end = endGate,
        endPin = pin,
        element = line
    )
    connections.push(newConnection)
    startGate.outConnections.push(newConnection)
    endGate.inConnections.push(newConnection)
    endGate.inputs[pin] = 0  // setting input pin of the endGate to false

    line = null
    startCell = null
    return 1
}

function moveLine(e){
    line.setAttribute("x2", e.clientX)
    line.setAttribute("y2", e.clientY)
    return
}


// Handling selection of logic gates  ------------------------------------

let selStartX = 0
let selStartY = 0
selectedCells = []

function initSelection(e){
    removeSelection()
    selRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    selRect.setAttribute("fill-opacity", 0)
    selRect.setAttribute("stroke-opacity", 1)
    selRect.setAttribute("x", e.clientX)
    selRect.setAttribute("y", e.clientY)
    selStartX = e.clientX
    selStartY = e.clientY
    selRect.setAttribute("width", 0)
    selRect.setAttribute("height", 0)

    svg.appendChild(selRect);
    return 1
}

function deploySelection(e){
    if (!selRect) return 0
    if (createShadowTable(selRect)) showCopyMenu(e)
    svg.removeChild(selRect)
    selRect = null
    return 1
}

function moveSelection(e){
    width = e.clientX - selStartX
    if (width > 0) {
        selRect.setAttribute("width", width)
    }
    else {
        selRect.setAttribute("x", e.clientX)
        selRect.setAttribute("width", Math.abs(width))
    }

    height = e.clientY - selStartY
    if (height > 0) {
        selRect.setAttribute("height", height)
    }
    else {
        selRect.setAttribute("y", e.clientY)
        selRect.setAttribute("height", Math.abs(height))
    }

    for (let i = 0; i < selectedCells.length; i++) {
        selectedCells[i].style.border = ""
    }
    selectedCells = []
    return 1
}


function createShadowTable(selRect){
    x = selRect.getAttribute("x");
    y = selRect.getAttribute("y");
    w = selRect.getAttribute("width");
    h = selRect.getAttribute("height");
    cellOffX = Math.floor(x / (cellEdge+2))
    cellOffY = Math.floor(y / (cellEdge+2))
    CellInW = Math.floor(w / (cellEdge+2))
    CellInH = Math.floor(h / (cellEdge+2))

    removeSelection()

    let croppedTopX = null
    let croppedTopY = null
    let croppedBottomX = null
    let croppedBottomY = null
    for (let cellY = 0; cellY < CellInH+1; cellY++) {
        for (let cellX = 0; cellX < CellInW+1; cellX++) {
            const selectedCell = select(cellX + cellOffX, tableHeight - (cellY + cellOffY) - 1);
            if (selectedCell.dataset.isGate){
                if (!croppedTopY){ croppedTopY = getCoords(selectedCell, "y") }
                
                if (! croppedTopX) croppedTopX = getCoords(selectedCell, "x")
                croppedTopX = Math.min(croppedTopX, getCoords(selectedCell, "x"))

                if (! croppedBottomX) croppedBottomX = getCoords(selectedCell, "x")
                croppedBottomX = Math.max(croppedBottomX, getCoords(selectedCell, "x"))

                if (! croppedBottomY) croppedBottomY = getCoords(selectedCell, "y")
                croppedBottomY = Math.min(croppedBottomY, getCoords(selectedCell, "y"))


                selectedCell.style.border = "solid 1px blue"
                selectedCells.push(selectedCell)
            }
        }
    }
    if (!croppedTopX && croppedTopX != 0) return 0

    // Create cropped selection :)

    for (let y = croppedTopY; y >= croppedBottomY; y--) {
        const selectionRow = document.createElement("tr")
        for (let x = croppedTopX; x <= croppedBottomX; x++) {
            const clonedCell = select(x, y).cloneNode(true)
            copyGate(select(x, y), clonedCell)  // Just to create the new logic gate
            selectionRow.appendChild(clonedCell)
        }
        shadowTable.appendChild(selectionRow)
    }

    // Copying connections on shadowTable

    let shadowTableGateList = []
    for (let i = 0; i < shadowTable.children.length; i++) {
        const row = shadowTable.children[i].children
        for (let j = 0; j < row.length; j++) {
            if (!row[j].dataset.isGate) { continue }
            shadowTableGateList.push(gates[row[j].dataset.gateId])
        }
    }

    console.log(shadowTableGateList)
    for (let i = 0; i < shadowTableGateList.length; i++) {
        const gate = shadowTableGateList[i]
        for (let j = 0; j < gate.outConnections.length; j++) {
            const conn = gate.outConnections[j]
            //if (!shadowTableGateList.includes(conn.start)){ continue }  // Checking if the connection is outside range
            const newConn = new Connection(gate, conn.end.clone, conn.endPin, conn.element)
            connections.push(newConn)
            console.log("clone", conn.end.clone)
            gate.outConnections[j] = newConn
            newConn.end.inConnections[newConn.end.inConnections.indexOf(conn)] = newConn

            const newConnElement = newConn.createElement()
            console.log(newConnElement)
            STsvg.appendChild(newConnElement)
        }
    }

    return 1
}

function getCoords(cell, coord){
    cellRow = cell.parentElement
    cellIndex = Array.from(cellRow.parentElement.children).indexOf(cellRow);
    if (coord == "y") return tableHeight - cellIndex - 1;

    return Array.from(cellRow.children).indexOf(cell);
}


// Handling copying gates (lol) -------------------------------------------

function copyGate(cell, targetCell){
    if (!cell.dataset.isGate) return
    const gate = gates[cell.dataset.gateId]
    const CopiedGate = new LogicGate(gate.evalState, targetCell, gate.maxConnection, gate.type)
    CopiedGate.state = gate.state
    CopiedGate.outConnections = gate.outConnections.slice()
    CopiedGate.inConnections = gate.inConnections.slice()
    CopiedGate.element = targetCell
    gates.push(CopiedGate)
    targetCell.dataset.gateId = gates.length-1
    gate.clone = CopiedGate
}

function select(x, y){
    const targetCell = container.children[tableHeight-y-1].children[x]
    return targetCell
}

function removeSelection(){
    const childCount = shadowTable.children.length
    for (let i = childCount-1; i >= 1; i--) {
        const child = shadowTable.children[i];
        shadowTable.removeChild(child)
    }
    shadowTable.style.display = "none"

    for (let i = 0; i < selectedCells.length; i++) {
        selectedCells[i].style.border = ""
    }
    selectedCells = []
}

function showCopyMenu(e){
    copyMenu.style.left = e.pageX + "px"
    copyMenu.style.top = e.pageY + "px"
    copyMenu.style.display = ""
}

function cancelSelection(){
    copyMenu.style.display = "none"
    
    removeSelection()
}

function moveShadowTable(e){
    if (!moveShadowMode){
        moveShadowMode = true
        copyMenu.style.display = "none"
        shadowTable.style.display = ""
    }
    shadowTable.style.left = e.pageX - cellEdge/2 + "px"
    shadowTable.style.top = e.pageY - cellEdge/2 + "px"
}

function placeSelection(e){
    shadowTable.style.display = "none"
    moveShadowMode = false
    const startCellX = e.clientX
    const startCellY = e.clientY

    // Copying LogicGates
    let copyedGates = []
    for (let i = 1; i < shadowTable.children.length; i++) {
        const row = shadowTable.children[i].children
        for (let j = 0; j < row.length; j++) {
            if (!row[j].dataset.isGate) { continue }
            const shadowCell = row[j].cloneNode(true)
            const targetCell = document.elementFromPoint(startCellX + j*cellEdge, startCellY + (i-1)*cellEdge)
            deleteGate(targetCell)
            const gate = gates[shadowCell.dataset.gateId]
            targetCell.dataset.gateId = shadowCell.dataset.gateId
            targetCell.dataset.isGate = shadowCell.dataset.isGate
            targetCell.innerText = shadowCell.innerText
            targetCell.style.backgroundColor = shadowCell.style.backgroundColor
            gate.element = targetCell  // Changing the element of the gate so that it's on the container
            copyedGates.push(gate)
        }
    }

    // Copying Connections
    for (let i = 0; i < copyedGates.length; i++) {
        const connsOut = copyedGates[i].outConnections
        for (let j = 0; j < connsOut.length; j++) {
            conn = connsOut[j]
            svg.appendChild(conn.createElement())  // Update the element cause now it's on the svg
        }
    }
}

function deleteSelection(){
    for (let i = 0; i < selectedCells.length; i++) {
        deleteGate(selectedCells[i])
    }
    cancelSelection()
}

// Infinite Grid

/*
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase()
    if (['w', 's', 'a', 'd'].includes(key)) {
        switch (key) {
            case 'w':
                var newRow = generateRow()
                container.insertBefore(newRow, container.firstChild)
                tableHeight++
                break
            case 's':
                var newRow = generateRow()
                container.appendChild(newRow)
                tableHeight++
                break
            case 'a':
                for (let i = 0; i < tableHeight; i++) {
                    const currentRow = container.children[i]
                    const cell = createCell()
                    currentRow.insertBefore(cell, currentRow.firstChild)
                }
                tableWidth++
                break
        }
    }
})
*/

function generateRow(){
    let row = document.createElement("tr")
    for (let i = 0; i < tableWidth; i++) {
        const cell = createCell()
        row.appendChild(cell)
    }
    return row
}

function createCell(){
    const cell = document.createElement("td")
    cell.style.width = cellEdge + "px"
    cell.style.height = cellEdge + "px"
    return cell
}
