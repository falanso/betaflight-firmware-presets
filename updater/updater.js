// updater.js

const fs = require('fs');
const path = require('path');

// --- Main Execution ---
function run() {
    // Get file paths from command line arguments
    const args = process.argv.slice(2); // Skip 'node' and 'updater.js'

    if (args.length < 2) {
        console.log("Usage: node updater.js <preset_file> <diff_file> [output_file]");
        console.log("\nDrag and drop your preset file, then your diff file onto the batch script.");
        console.log("If [output_file] is not provided, it will default to 'updated_[preset_file_name]'.");
        return;
    }

    const presetFileIn = args[0];
    const diffFileIn = args[1];
    // Default the output name if not provided
    const presetFileOut = args[2] || `updated_${path.basename(presetFileIn)}`;

    console.log(`Preset file: ${presetFileIn}`);
    console.log(`Diff file:   ${diffFileIn}`);
    console.log(`Output file: ${presetFileOut}\n`);

    const valuesFromDiff = parseDiffFile(diffFileIn);

    if (valuesFromDiff) {
        processPresetFile(presetFileIn, presetFileOut, valuesFromDiff);
        console.log(`\nSuccess! The updated configuration has been saved to '${presetFileOut}'`);
    } else {
        console.log("\nScript failed due to errors reading the input files.");
    }
}


/**
 * Parses the 'diff all' file and extracts all 'set' variables and their values.
 * @param {string} filename - The path to the diff file.
 * @returns {Map<string, string> | null} A map of {variable: value} or null on error.
 */
function parseDiffFile(filename) {
    console.log(`Reading values from '${path.basename(filename)}'...`);
    const updateValues = new Map();
    try {
        const fileContent = fs.readFileSync(filename, 'utf-8');
        const lines = fileContent.split(/\r?\n/);

        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('set ')) {
                const parts = cleanLine.split('=', 2);
                if (parts.length === 2) {
                    const variableName = parts[0].replace('set ', '').trim();
                    // The value is the first word after the '='
                    const value = parts[1].trim().split(/\s+/)[0];
                    updateValues.set(variableName, value);
                }
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: Input file '${filename}' not found.`);
        } else {
            console.error(`An error occurred while reading '${filename}':`, error);
        }
        return null;
    }

    console.log(`Found ${updateValues.size} 'set' commands to use for updating.`);
    return updateValues;
}

/**
 * Reads the preset file, updates the values, and writes to a new file.
 * @param {string} presetIn - The input preset file path.
 * @param {string} presetOut - The output file path.
 * @param {Map<string, string>} updateValues - The map of values to update.
 */
function processPresetFile(presetIn, presetOut, updateValues) {
    console.log(`\nProcessing '${path.basename(presetIn)}' and writing to '${path.basename(presetOut)}'...`);
    let linesUpdated = 0;
    try {
        const fileContent = fs.readFileSync(presetIn, 'utf-8');
        const lines = fileContent.split(/\r?\n/);
        const outputLines = [];

        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('set ')) {
                const parts = line.split('=', 2);
                if (parts.length === 2) {
                    const commandPart = parts[0];
                    const variableName = commandPart.replace('set ', '').trim();

                    if (updateValues.has(variableName)) {
                        const newValue = updateValues.get(variableName);
                        const valueAndComment = parts[1].trim();
                        
                        const originalValueMatch = valueAndComment.match(/^\S+/);
                        if (originalValueMatch) {
                            const originalValue = originalValueMatch[0];
                            const restOfLine = valueAndComment.substring(originalValue.length);
                            const newLine = `${commandPart.trim()} = ${newValue}${restOfLine}`;
                            outputLines.push(newLine);
                            linesUpdated++;
                        } else {
                            outputLines.push(line); // Fallback
                        }
                    } else {
                        outputLines.push(line); // Variable not in diff, keep original
                    }
                } else {
                    outputLines.push(line); // Not a valid 'set =', keep original
                }
            } else {
                outputLines.push(line); // Not a 'set' command, keep original
            }
        }
        fs.writeFileSync(presetOut, outputLines.join('\n'), 'utf-8');

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: Input file '${presetIn}' not found.`);
        } else {
            console.error(`An error occurred during processing:`, error);
        }
        return;
    }

    console.log(`Processing complete. Updated ${linesUpdated} lines.`);
}

// Run the main function
run();
