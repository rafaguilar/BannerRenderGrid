'use server';
/**
 * @fileOverview This file defines a Genkit flow to map CSV columns to JavaScript variables in Dynamic.js using AI.
 *
 * - mapCsvColumnsToJsVariables - A function that takes the content of Dynamic.js and a list of CSV columns and returns a mapping of CSV columns to JavaScript variables.
 * - MapCsvColumnsToJsVariablesInput - The input type for the mapCsvColumnsToJsVariables function.
 * - MapCsvColumnsToJsVariablesOutput - The return type for the mapCsvColumnsToJsVariables function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapCsvColumnsToJsVariablesInputSchema = z.object({
  dynamicJsContent: z.string().describe('The content of the Dynamic.js file.'),
  csvColumns: z.array(z.string()).describe('A list of column names from the CSV file.'),
});

export type MapCsvColumnsToJsVariablesInput = z.infer<typeof MapCsvColumnsToJsVariablesInputSchema>;

const MapCsvColumnsToJsVariablesOutputSchema = z.record(z.string(), z.string()).describe('A mapping of CSV column names to JavaScript variable names.');

export type MapCsvColumnsToJsVariablesOutput = z.infer<typeof MapCsvColumnsToJsVariablesOutputSchema>;

export async function mapCsvColumnsToJsVariables(input: MapCsvColumnsToJsVariablesInput): Promise<MapCsvColumnsToJsVariablesOutput> {
  return mapCsvColumnsToJsVariablesFlow(input);
}

const mapCsvColumnsToJsVariablesPrompt = ai.definePrompt({
  name: 'mapCsvColumnsToJsVariablesPrompt',
  input: {schema: MapCsvColumnsToJsVariablesInputSchema},
  output: {schema: MapCsvColumnsToJsVariablesOutputSchema},
  prompt: `You are an expert at mapping CSV column names to JavaScript variables in a given JavaScript file.

You will be given the content of a JavaScript file (Dynamic.js) and a list of column names from a CSV file.

Your task is to create a JSON object that maps each CSV column name to the corresponding JavaScript variable name in the Dynamic.js file.

Consider the context and purpose of each variable when making the mapping. If a column cannot be mapped, leave it out of the JSON object.

Dynamic.js content:
{{{dynamicJsContent}}}

CSV Columns:
{{{csvColumns}}}

Output a JSON object with the mapping:
`,
});

const mapCsvColumnsToJsVariablesFlow = ai.defineFlow(
  {
    name: 'mapCsvColumnsToJsVariablesFlow',
    inputSchema: MapCsvColumnsToJsVariablesInputSchema,
    outputSchema: MapCsvColumnsToJsVariablesOutputSchema,
  },
  async input => {
    const {output} = await mapCsvColumnsToJsVariablesPrompt(input);
    return output!;
  }
);
