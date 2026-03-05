#!/usr/bin/env node

import { Command } from 'commander';
import { find, sync } from './core/find';

const program = new Command();

program
  .name('apifox')
  .description('Apifox CLI tool for importing and exporting OpenAPI/Postman data')
  .version('1.0.1');

program
  .command('sync')
  .description('Sync Apifox projects and interfaces to local cache')
  .action(async () => {
    try {
      await sync();
      console.log('\nSync completed.\n');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

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
      console.log(JSON.stringify(results))
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();
