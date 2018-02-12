# Area
Surface area calculator
## What is it ?
Area is a simple tool to draw surfaces and instantly get their surface (in m²). It has been developped for the website donga.fr and is visible live at the following address : https://www.donga.fr/area/.

The area calculation is done through a Delaunay triangulation with the earcut.js library. One downside of this implementation is when you have eyes (crossing sides), it may result in false area. Another way of calculating simply an complex area is by counting pixels. But it complexifies the app as you have to separate the shapes itself from the controls and labels (otherwise, their pixels are counted as well), and the delaunay triangulation is also much faster as well.
## Functionalities
- [x] Upload and manipulate a plan (to draw above)
- [x] Auto-transform PDF (plan) to image
- [x] Export as JPG
- [x] Draw multiple shapes
- [ ] Share "walls" in between shapes/rooms
- [ ] Lock handles
- [ ] Improve "eye" results
- [x] Manually enter wall sizes (double-click on labels)
## Notes
This tool is shared here and is available to be used freely. Though, I never took the time to clean it and this git contains all the tests and unused files. You are free to delete whatever is useless and improve the spaghetti code.