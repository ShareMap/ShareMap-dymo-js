http://codepen.io/soulwire/pen/DoIuf

Demonstrates collision detection between convex and non-convex polygons
 and how to detect whether a point vector is contained within a polygon
 
 Possible techniques:
 
 x Bounding box or radii
 Inacurate for complex polygons
 
 x SAT (Separating Axis Theorem)
 Only handles convex polygons, so non-convex polygons must be subdivided
 
 x Collision canvas. Draw polygon A then polygon B using `source-in`
 Slow since it uses getImageData and pixels must be scanned. Algorithm
 can be improved by drawing to a smaller canvas but downsampling effects
 accuracy and using canvas transformations (scale) throws false positives
 
 - Bounding box + line segment intersection
 Test bounding box overlap (fast) then proceed to per edge intersection
 detection if necessary. Exit after first intersection is found since
 we're not simulating collision responce. This technique fails to detect
 nested polygons, but since we're testing moving polygons it's ok(ish)
