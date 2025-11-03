# **App Name**: BannerBuildr

## Core Features:

- Template Upload: Upload a compressed HTML banner template including HTML, JS, and CSS files.
- Data Import: Import data from an Excel file (e.g., .xlsx, .csv) containing variable values for the banner template. Data values are used for banner generation.
- Variable Overwrite: Dynamically overwrite the values of variables within the 'Dynamic.js' file using data imported from the Excel file. Supports multiple variable replacements based on column names in the Excel file. A LLM-powered tool reasons to determine how a requested column in the CSV maps to internal javascript variables inside Dynamic.js
- Banner Preview: Generate and display a preview of each banner variation, reflecting the overwritten variable values for each row in the Excel file.
- Batch Generation: Automatically generate all banner variations based on the data from the Excel file.
- Download ZIP Archives: Download each generated banner variation as an individual ZIP file, containing the updated HTML, JS, and CSS files.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a professional and trustworthy feel.
- Background color: Light gray (#F5F5F5) for a clean and neutral canvas.
- Accent color: Vibrant orange (#FF9800) to highlight key actions and interactive elements.
- Body font: 'Inter', a sans-serif font, for a modern and readable interface.
- Headline font: 'Space Grotesk', a sans-serif font, for impactful headlines.
- Use clean and simple icons to represent different functions such as upload, download, and preview.
- Implement a clear and structured layout with a focus on usability. Utilize whitespace effectively to avoid clutter and improve readability.
- Use subtle animations to provide feedback on user interactions (e.g., button clicks, loading states).