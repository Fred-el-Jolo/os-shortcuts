# os-shortcuts

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.


New file: src/generate-html/generate.ts                                                                        
  - Bun script that reads binds.json, processes all binds using the same logic as the old view script            
  - export const SHORTCUT_ORDER: string[] — flat array of all 83 unique descriptions, grouped by category in     
  comments for easy manual reordering                                                                            
  - export const CATEGORIES — 9 named sections (Launcher, System, Apps, Windows, Groups, Workspaces, Media &     
  Audio, Screenshots & Recording, Clipboard & Utilities)                                                    
  - Sorts binds by position in SHORTCUT_ORDER, groups by CATEGORIES, renders full self-contained HTML            
  - Unrecognized descs fall into an "Other" section automatically                                    
                                                                                                                 
  Updated package.json:                                                                                          
  - Added "gen:html": "bun run src/generate-html/generate.ts"                                                    
  - start now runs gen:html first, so the HTML is always fresh before dev                                        
                                                                                                                 
  Updated electrobun.config.ts:                                                                                  
  - Removed views entry — no more JS bundle for main-ui                     
  - copy entry unchanged — still copies the static HTML to the views directory                                   
                                                                              
  To reorder shortcuts: edit SHORTCUT_ORDER in generate.ts, then run bun run gen:html.                           
  To change groupings: edit the descs arrays in CATEGORIES.
