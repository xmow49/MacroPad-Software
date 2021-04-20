var mini = false;

function toggleSidebar() {
    if (mini) {
        document.getElementById("mainMenu").style.width = "250px";
        this.mini = false;
    } else {
        document.getElementById("mainMenu").style.width = "85px";;
        this.mini = true;
    }
}

toggleSidebar()