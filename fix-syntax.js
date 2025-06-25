#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix broken objects and functions after aggressive console.log removal
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix broken object patterns
    const fixes = [
        // Fix empty objects followed by closing brace
        [/{\s*}\s*\)/g, '{}'],
        
        // Fix missing properties in state objects  
        [/set\(\{\s*\}\);/g, 'set({});'],
        
        // Fix missing default values in schemas
        [/z\.object\(\{\s*\}\);/g, 'z.object({});'],
        
        // Fix broken defaultValues
        [/defaultValues:\s*\{\s*\},/g, 'defaultValues: {},'],
        
        // Fix broken query keys
        [/queryKey:\s*\[\],/g, 'queryKey: [],'],
        
        // Fix broken object returns
        [/return\s*\{\s*\}\s*;/g, 'return {};'],
        
        // Fix broken function parameters
        [/\(\{\s*\}\)\s*=>/g, '({}) =>'],
    ];

    fixes.forEach(([pattern, replacement]) => {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
    }
}

// Find and fix all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx}', { 
    cwd: '/Users/ahmed/Desktop/rmz-app/storefront-example'
}).map(f => path.join('/Users/ahmed/Desktop/rmz-app/storefront-example', f));

files.forEach(fixFile);

console.log('Syntax fixes completed!');