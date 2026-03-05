#!/usr/bin/env node

import { Command } from 'commander';
import { find } from './core/find';

const program = new Command();

program
  .name('apifox')
  .description('Apifox CLI tool for importing and exporting OpenAPI/Postman data')
  .version('1.0.1');

program
  .command('find <keyword>')
  .description('Search for interfaces by keyword')
  .action(async (keyword: string) => {
    try {
      const results = await find(keyword);
      if (results.length === 0) {
        console.log(`\nNo results found for "${keyword}"\n`);
        return;
      }
      console.log(`\nFound ${results.length} result(s):\n`);
      console.log('─'.repeat(80));
      console.log(JSON.stringify(results))
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
