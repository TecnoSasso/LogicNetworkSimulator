<img width="100" align="left" style="float: left; margin: 0 15px 0 0;" alt="Full Adder" src="https://raw.githubusercontent.com/TecnoSasso/LogicNetworkSimulator/main/img/logo.png">

LOGIC NETWORK SIMULATOR
=

## Overview

This project is an interactive **Logic Network Simulator** that allows you to design and simulate digital circuits. You can add various logic gates (AND, OR, XOR, NOR) and components like LEDs and buttons on a grid-based interface. Connections between gates can be created to visualize and simulate the flow of logic in real time. Logic Network Simulator runs entirely in the browser, making it lightweight and accessible.

## Features

- **Add and Remove Components**: Place logic gates, LEDs, and buttons on the grid.
- **Live Simulation**: Visualize the behavior of circuits as inputs change.
- **Adjustable Speed**: Control the simulation speed from 0 to 256 TPS (Ticks Per Second).
- **Copy and Paste**: Duplicate circuit components for quicker designs.
- **Responsive UI**: Easy interaction with gates and connections.


<img alt="Decoder" src="https://raw.githubusercontent.com/TecnoSasso/LogicNetworkSimulator/main/img/decoder.png">


## Requirements

To run the Logic Network Simulator, you only need a browser. No additional software or plugins are required.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TecnoSasso/LogicNetworkSimulator.git
   cd LogicNetworkSimulator
   ```
2. Open index.html in your web browser.

## How to Play

1. **Add Components:**

    - Use the dropdown menu to select a component (e.g. AND Gate, Button, LED).
    - Click on a cell in the grid to place the selected component.

2. **Create Connections**:

    - Click and drag from one component to another to create a connection.
    - Components can only connect to available pins.

3. **Simulate:**

    - Use the speed selector to adjust the simulation speed.
    - Press buttons to toggle their state and observe the changes in the connected components.

4. **Copy and Delete:**

    - Drag to select multiple components.
    - Use the Copy and Delete buttons to duplicate or remove selected components.

5. **Reset:**

Refresh the page to clear the grid and start fresh.
## File Structure
    - index.html: The main HTML file containing the user interface.
    - script.js: Contains the simulation logic and interactivity.
    - styles.css: (Optional) Placeholder for future custom styles.
## Contribution
Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code follows the existing style and is well-documented.

## License
This project is licensed under the MIT License. See the [LICENSE](license) file for details.

<img alt="Seven Segment Display" src="https://raw.githubusercontent.com/TecnoSasso/LogicNetworkSimulator/main/img/seven_segment_display.png">

