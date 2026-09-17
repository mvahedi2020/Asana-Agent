import {it,expect} from 'vitest';
import {isTask,isTaskList,seedTasks} from './logic';
it('rejects impossible calendar dates in saved records',()=>{for(const due of ['2026-99-99','2026-02-30','invalid'])expect(isTask({...seedTasks[0],due})).toBe(false);expect(isTask({...seedTasks[0],due:'2028-02-29'})).toBe(true);});
it('rejects duplicate task ids in a saved workspace',()=>{expect(isTaskList(seedTasks)).toBe(true);expect(isTaskList([seedTasks[0],{...seedTasks[1],id:seedTasks[0].id}])).toBe(false);});
it('rejects saved tasks without a usable identity or display context',()=>{for(const patch of [{id:' '},{title:''},{project:'  '}])expect(isTask({...seedTasks[0],...patch})).toBe(false);});
