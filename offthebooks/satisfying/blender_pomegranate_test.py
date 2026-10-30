import bpy, bmesh, math, random, time
from mathutils import Vector, Euler, Matrix
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 40; sc.cycles.use_denoising = True; sc.cycles.max_bounces = 4; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 2
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
random.seed(4)

def mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; return m, m.node_tree.nodes, m.node_tree.links
def node(nodes, t, **kw):
    n = nodes.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n

# ---------- wood board ----------
m, N, L = mat('wood'); P = N['Principled BSDF']
tc = node(N, 'ShaderNodeTexCoord'); mp = node(N, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (.35, 1, 1)
L.new(tc.outputs['Object'], mp.inputs[0])
wave = node(N, 'ShaderNodeTexWave'); wave.wave_type = 'BANDS'; wave.bands_direction = 'Y'; wave.inputs['Scale'].default_value = 2.2; wave.inputs['Distortion'].default_value = 3.5; wave.inputs['Detail'].default_value = 6; wave.inputs['Detail Scale'].default_value = 2
L.new(mp.outputs[0], wave.inputs[0])
ramp = node(N, 'ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (.5, .3, .13, 1); ramp.color_ramp.elements[1].color = (.66, .43, .22, 1)
L.new(wave.outputs['Fac'], ramp.inputs[0]); L.new(ramp.outputs[0], P.inputs['Base Color']); P.inputs['Roughness'].default_value = .55
bump = node(N, 'ShaderNodeBump'); bump.inputs['Strength'].default_value = .08; L.new(wave.outputs['Fac'], bump.inputs['Height']); L.new(bump.outputs[0], P.inputs['Normal'])
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -.18)); board = bpy.context.object; board.scale = (8.8, 6.0, .36)
bpy.ops.object.transform_apply(scale=True); mod = board.modifiers.new('b', 'BEVEL'); mod.width = .08; mod.segments = 4
board.data.materials.append(m); board.rotation_euler.z = -.04

# ---------- counter + brick wall ----------
m2, N2, L2 = mat('counter'); N2['Principled BSDF'].inputs['Base Color'].default_value = (.03, .025, .02, 1); N2['Principled BSDF'].inputs['Roughness'].default_value = .8
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -.36)); bpy.context.object.data.materials.append(m2)
m3, N3, L3 = mat('brick'); br = node(N3, 'ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 7
br.inputs['Color1'].default_value = (.06, .045, .035, 1); br.inputs['Color2'].default_value = (.045, .035, .028, 1); br.inputs['Mortar'].default_value = (.012, .01, .009, 1)
L3.new(br.outputs['Color'], N3['Principled BSDF'].inputs['Base Color']); N3['Principled BSDF'].inputs['Roughness'].default_value = .95
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 9, 6), rotation=(-math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(m3)

# ---------- materials of the fruit ----------
skin, NS, LS = mat('skin'); PS = NS['Principled BSDF']
noi = node(NS, 'ShaderNodeTexNoise'); noi.inputs['Scale'].default_value = 3.5; noi.inputs['Detail'].default_value = 8
rs = node(NS, 'ShaderNodeValToRGB'); e = rs.color_ramp.elements
e[0].position, e[0].color = .35, (.22, .008, .018, 1); e[1].position, e[1].color = .72, (.55, .06, .05, 1)
e2 = rs.color_ramp.elements.new(.9); e2.color = (.62, .3, .08, 1)
LS.new(noi.outputs['Fac'], rs.inputs[0]); LS.new(rs.outputs[0], PS.inputs['Base Color'])
PS.inputs['Roughness'].default_value = .35; PS.inputs['Coat Weight'].default_value = .5; PS.inputs['Coat Roughness'].default_value = .2
sp = node(NS, 'ShaderNodeTexNoise'); sp.inputs['Scale'].default_value = 140; bs = node(NS, 'ShaderNodeBump'); bs.inputs['Strength'].default_value = .12
LS.new(sp.outputs['Fac'], bs.inputs['Height']); LS.new(bs.outputs[0], PS.inputs['Normal'])
# arils: voronoi cells = glossy translucent red seeds, cell borders = cream membrane
aril, NA, LA = mat('aril'); PA = NA['Principled BSDF']
vor = node(NA, 'ShaderNodeTexVoronoi'); vor.feature = 'DISTANCE_TO_EDGE'; vor.inputs['Scale'].default_value = 22
ra = node(NA, 'ShaderNodeValToRGB'); ea = ra.color_ramp.elements
ea[0].position, ea[0].color = .0, (.85, .72, .5, 1); ea[1].position, ea[1].color = .07, (.32, .0, .02, 1)
e3 = ra.color_ramp.elements.new(.2); e3.color = (.55, .01, .05, 1)
LA.new(vor.outputs['Distance'], ra.inputs[0]); LA.new(ra.outputs[0], PA.inputs['Base Color'])
PA.inputs['Roughness'].default_value = .12; PA.inputs['Coat Weight'].default_value = .8; PA.inputs['Subsurface Weight'].default_value = .25
PA.inputs['Subsurface Radius'].default_value = (.3, .02, .02)
ba = node(NA, 'ShaderNodeBump'); ba.inputs['Strength'].default_value = .5; LA.new(vor.outputs['Distance'], ba.inputs['Height']); LA.new(ba.outputs[0], PA.inputs['Normal'])
pith, NP, LP = mat('pith'); NP['Principled BSDF'].inputs['Base Color'].default_value = (.85, .7, .45, 1); NP['Principled BSDF'].inputs['Roughness'].default_value = .6

# ---------- the uncut back part of the fruit: an ellipsoid bisected at the cut plane, cut face filled with arils ----------
RX, RY, RZ = 1.3, 1.3, 1.2; ZC = -.15                                    # z up in Blender; y is depth (camera at -y)
bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=128, v_segments=96, radius=1)
for v in bm.verts: v.co = Vector((v.co.x * RX, v.co.y * RY, v.co.z * RZ + RZ))
cut = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, ZC, 0), plane_no=(0, -1, 0), clear_inner=True)
edges = [e for e in cut['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
fill = bmesh.ops.edgeloop_fill(bm, edges=edges)
for f in bm.faces: f.material_index = 0; f.smooth = True
for f in fill['faces']: f.material_index = 1; f.smooth = False
me = bpy.data.meshes.new('fruit'); bm.to_mesh(me); fruit = bpy.data.objects.new('fruit', me); bpy.context.collection.objects.link(fruit)
me.materials.append(skin); me.materials.append(aril)
# crown
mc, NC, LC = mat('crown'); NC['Principled BSDF'].inputs['Base Color'].default_value = (.25, .05, .03, 1); NC['Principled BSDF'].inputs['Roughness'].default_value = .7
for k in range(6):
    a = k / 6 * 6.283
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=.09, depth=.36, location=(.1 + math.cos(a) * .15, .3 + math.sin(a) * .15, 2 * RZ + .08), rotation=(math.sin(a) * .6, -math.cos(a) * .6, 0))
    bpy.context.object.data.materials.append(mc)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.19, depth=.16, location=(.1, .3, 2 * RZ - .01)); bpy.context.object.data.materials.append(mc)

# ---------- the pile: thousands of bevelled cubes of seeds pouring into a cone in front ----------
bm = bmesh.new(); s = .085; N_CUBES = 5200
for i in range(N_CUBES):
    f = (i + 1) / N_CUBES; u = math.sqrt(random.random()); th = random.random() * 6.283
    R, H = 2.1 * f ** (1 / 3), 2.0 * f ** (1 / 3)
    x, y = R * u * math.cos(th) * 1.05, -1.5 + R * u * math.sin(th) * .9
    z = H * (1 - u) + s * .5
    if i > N_CUBES - 220:                                                  # a few still falling from the cut face
        x, y, z = (random.random() - .5) * 2.2, ZC - .2 - random.random() * .5, .4 + random.random() * 1.9
    sz = s * (.75 + .5 * random.random())
    r = bmesh.ops.create_cube(bm, size=sz)
    M = Matrix.Translation((x, y, z)) @ Euler((random.random() * 6.3, random.random() * 6.3, random.random() * 6.3)).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=M, verts=r['verts'])
    if random.random() < .18:
        fs = list({f for v in r['verts'] for f in v.link_faces}); fs[0].material_index = 1
bmesh.ops.bevel(bm, geom=bm.edges[:], offset=.008, segments=1, affect='EDGES')
me = bpy.data.meshes.new('pile'); bm.to_mesh(me); pile = bpy.data.objects.new('pile', me); bpy.context.collection.objects.link(pile)
me.materials.append(aril); me.materials.append(skin)

# ---------- knife: steel blade + wooden handle, coming from the right side ----------
steel, NK, LK = mat('steel'); PK = NK['Principled BSDF']; PK.inputs['Base Color'].default_value = (.85, .86, .88, 1); PK.inputs['Metallic'].default_value = 1; PK.inputs['Roughness'].default_value = .16
prof = [(0, 0), (3.0, 0), (3.8, .02), (4.3, .25), (4.7, .62), (4.0, .8), (3.1, .93), (2.1, .99), (0, 1.02)]
bm = bmesh.new(); vs = [bm.verts.new((-x * 1.3, 0, y * 1.3)) for x, y in prof]; f = bm.faces.new(vs)
ext = bmesh.ops.extrude_face_region(bm, geom=[f]); bmesh.ops.translate(bm, vec=(0, .035, 0), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
me = bpy.data.meshes.new('blade'); bm.to_mesh(me); bl = bpy.data.objects.new('blade', me); bpy.context.collection.objects.link(bl)
bl.data.materials.append(steel); bl.location = (3.2, ZC - .3, 2.9); md = bl.modifiers.new('b', 'BEVEL'); md.width = .01
bpy.ops.mesh.primitive_cube_add(size=1, location=(4.7, ZC - .28, 3.75)); hd = bpy.context.object; hd.scale = (2.5, .26, .56)
hk, NH, LH = mat('handle'); NH['Principled BSDF'].inputs['Base Color'].default_value = (.2, .08, .03, 1); NH['Principled BSDF'].inputs['Roughness'].default_value = .45; hd.data.materials.append(hk)
bpy.ops.object.transform_apply(scale=True); md = hd.modifiers.new('b', 'BEVEL'); md.width = .1; md.segments = 4
for xx in (4.0, 4.7, 5.4):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.06, depth=.3, location=(xx, ZC - .28, 3.75), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(steel)

# ---------- light and camera ----------
bpy.ops.object.light_add(type='AREA', location=(-4, -2, 10)); Lt = bpy.context.object; Lt.data.energy = 2600; Lt.data.size = 5; Lt.rotation_euler = (0, -.3, 0)
bpy.ops.object.light_add(type='AREA', location=(5, -8, 5)); f2 = bpy.context.object; f2.data.energy = 500; f2.data.size = 6; f2.rotation_euler = (math.radians(60), 0, math.radians(30))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = .25
bpy.ops.object.camera_add(location=(-3.6, -14.5, 12.5)); c = bpy.context.object; sc.camera = c
tgt = Vector((.2, -.8, 1.0)); d = tgt - c.location; c.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); c.data.lens = 46
c.data.dof.use_dof = True; c.data.dof.focus_distance = d.length; c.data.dof.aperture_fstop = 4.0
sc.render.filepath = '/tmp/claude-0/-home-user-Musteribulun42/7a25263b-3020-51be-b67b-ca0702910fed/scratchpad/bpom.png'
t = time.time(); bpy.ops.render.render(write_still=True); print('RENDER_SECONDS', round(time.time() - t, 1))
