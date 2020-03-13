import { SimpleEditor } from './simple/SimpleEditor';
import { Session } from './simple/Session';

function debugLVL() {
    new SimpleEditor(
            // new Session('assets/lvl/hz.lvl'),
            new Session('assets/lvl/zone66.lvl'),
            // new Session('assets/lvl/burstwars.lvl'),
            // new Session("assets/lvl/thefield.lvl", ['assets/lvz/thefield.lvz'])
            new Session("assets/lvl/crosshunt.lvl", ['assets/lvz/#SpaceBG2.lvz', 'assets/lvz/@crosshunt.lvz','assets/lvz/&AstSet_1.lvz'])
    );
}

// Entry Point from HTML.
export let start = function () {
    setTimeout(() => {
        console.log("### START ###");
        debugLVL();
    }, 10);
};

