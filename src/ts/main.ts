import { SimpleEditor } from './simple/SimpleEditor';
import { Session } from './simple/Session';

function debugLVL() {
    new SimpleEditor(
        [
            // new Session('assets/lvl/hz.lvl'),
            new Session('assets/lvl/zone66.lvl'),
            // new Session('assets/lvl/burstwars.lvl'),
            new Session("assets/lvl/thefield.lvl", ['assets/lvz/thefield.lvz'])
        ]
    );
}

export let start = function () {
    setTimeout(() => {
        console.log("### START ###");
        debugLVL();
    }, 10);
};

