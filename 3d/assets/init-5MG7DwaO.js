import{p as we,B as Ee,U as at,D as nt,a as ot,C as Ae,M as Ve,R as z,b as Fe,w as st,c as it,d as pe,r as Ne,e as Ue,f as ut,g as ct,i as lt,h as dt,j as ft,k as pt,l as mt,m as gt,n as ht,o as bt,q as _e,s as Be,t as xt,v as vt,u as St,x as yt,N as wt,y as _t,z as Bt,A as Dt,E as Ct,S as Gt,F as Mt,G as je,H as It,I as De,J as Ce,K as Pt,L as Tt,O as Rt}from"./toneMappingBits-9EQJdWVz.js";import{j as k,w as T,a as W,m as ie,c as $t,b as Ge,z as Lt,A as Ot,F as Q,H as Et,S as J,g as At,R as ze,C as Vt,o as Ft}from"./Geometry-C3efUol-.js";import{B as Nt}from"./BufferResource-B1zu60FK.js";import{L as Ut,G as ge,B as he,R as ke,a as We,c as jt,V as zt,S as kt,C as Wt,l as Ht,r as He,b as Kt,i as qt,g as Ke,e as Yt,d as Jt,f as Me,h as Xt,j as Zt,m as Qt,k as ue,n as er,o as Ie,s as tr,p as rr,q as ar,t as nr,u as or,v as sr,w as ir,x as ur,y as cr,z as lr,A as dr,D as fr,E as te,F as be,H as xe,I as pr,J as mr,M as gr,K as hr,N as br,O as xr,P as vr,Q as Pe,T as Sr,U as yr,W as wr,X as _r}from"./View3DGlobalData-CB6nBNDZ.js";import{C as Br}from"./CullResults-DDhkRkOd.js";import{S as Dr}from"./State-kd7PmBSw.js";import"./RenderTarget-Bn9o-5A8.js";import"./isMobile-CjBdU-FT.js";import"./init-DZl2AcNQ.js";import"./ImageSource-RiDFh97K.js";import"./Cache--prNOUP3.js";import"./createUboElementsWGSL-DCJBugEr.js";import"./TextureView-DNuYraU9.js";import"./isSafari-DQHbtFca.js";import"./RenderTexture-BLX9W3By.js";import"./GCManagedHash-C53wrcNP.js";const Te={atlas:null,indexCount:void 0,firstIndex:void 0,baseVertex:void 0};var Cr=class{_materialSystem;constructor(e){this._materialSystem=e}render(e){const{renderables:t,globalBindGroup:r,commandList:a,drawData:n,passBit:i,bindsMaterial:o,batch:u,view3d:s}=e,c=t.count;if(c===0)return;a.clear();const l=t.indices,f=t.items,m=this._materialSystem;let d=f[l[0]],p=d._passCache[i],h=d.geometry._geometryAtlasAllocation||Te,y=p.batchKey,x=h.atlas?h.atlas.geometry:d.geometry,v=p.shader,b=we(y,p.state),_=p.topology,g=d.material,S=0,D=0,C=0,P=g,G=!1;o&&a.captureMaterialTextures(g);for(let w=1;w<c;w++){d=f[l[w]],p=d._passCache[i];const M=p.batchKey,B=d.material,U=M!==y;if(!U&&(!o||B===g))continue;const j=!U&&g._textureSetId===B._textureSetId;if(j){if(G){g=B;continue}if(a.count-C+2>16){a.count=C,S=D,G=!0,v=m.ensureMergedShader(f[l[D]],u,s),g=B;continue}}const I=a.next();I.geometry=x,I.shader=v,I.globalBindGroup=r,I.batchBindGroup=o?G?P._getMergedBindGroup():g._getBindGroup():void 0,I.state=b,I.topology=_,I.batchKey=y,I.textureSetId=o?P._textureSetId:0,I.merged=o&&G,a.captureGeometry(x);const R=(a.count-1)*5,$=n.ensureCapacity(a.count);$[R]=h.indexCount??(x.indexCount||x.indexBuffer.data.length),$[R+1]=w-S,$[R+2]=h.firstIndex||0,$[R+3]=h.baseVertex||0,$[R+4]=S,S=w;const ae=B!==g;g=B,j||(U&&(h=d.geometry._geometryAtlasAllocation||Te,y=M,x=h.atlas?h.atlas.geometry:d.geometry,b=we(M,p.state),_=p.topology),v=p.shader,D=w,C=a.count,P=B,G=!1),o&&ae&&(j?a.refreshMaterialBindings(B):a.captureMaterialTextures(B))}{const w=a.next();w.geometry=x,w.shader=v,w.globalBindGroup=r,w.batchBindGroup=o?G?P._getMergedBindGroup():g._getBindGroup():void 0,w.state=b,w.topology=_,w.batchKey=y,w.textureSetId=o?P._textureSetId:0,w.merged=o&&G,a.captureGeometry(x);const M=(a.count-1)*5,B=n.ensureCapacity(a.count);B[M]=h.indexCount??(x.indexCount||x.indexBuffer.data.length),B[M+1]=c-S,B[M+2]=h.firstIndex||0,B[M+3]=h.baseVertex||0,B[M+4]=S}a.endBuild()}};const N=new Nt({buffer:new Ee({data:new Int32Array(1),usage:k.STORAGE|k.COPY_DST|k.COPY_SRC,label:"EmptyBufferResource",shrinkToFit:!1})});function Gr(e,t,r){T(`[collectAttributes] Attribute "${e}" redefined with different format: "${r}" → "${t}". Keeping original.`)}function Mr(e){const t=Object.create(null);for(const r of e)if(r.attributes)for(const[a,n]of Object.entries(r.attributes))a in t?t[a]!==n&&Gr(a,n,t[a]):t[a]=n;return t}const qe=`
struct DrawArgs {
  indexCount: u32,
  instanceCount: atomic<u32>,
  firstIndex: u32,
  baseVertex: u32,
  firstInstance: u32,
};
`,Ir=`
${qe}
@group(0) @binding(0) var<storage, read_write> drawCalls: array<DrawArgs>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let k = gid.x;
  if (k >= arrayLength(&drawCalls)) { return; }
  atomicStore(&drawCalls[k].instanceCount, 0u);
}
`,Pr=`
${qe}
struct Frustum { planes: array<vec4<f32>, 6> };

@group(0) @binding(0) var<storage, read>       srcInstances: array<u32>;
@group(0) @binding(1) var<storage, read_write> dstInstances: array<u32>;
@group(0) @binding(2) var<storage, read_write> drawCalls:    array<DrawArgs>;
@group(0) @binding(3) var<storage, read>       store:        array<u32>;
@group(0) @binding(4) var<storage, read>       geomBounds:   array<vec4<f32>>;
@group(0) @binding(5) var<uniform>             frustum:      Frustum;

const STRIDE: u32 = 24u;
const GEOM_LANE: u32 = 18u;
const VIS_LANE: u32 = 19u;
const NO_BOUNDS: u32 = 0xffffffffu;

fn loadMatrix(base: u32) -> mat4x4<f32> {
  return mat4x4<f32>(
    bitcast<f32>(store[base + 0u]),  bitcast<f32>(store[base + 1u]),  bitcast<f32>(store[base + 2u]),  bitcast<f32>(store[base + 3u]),
    bitcast<f32>(store[base + 4u]),  bitcast<f32>(store[base + 5u]),  bitcast<f32>(store[base + 6u]),  bitcast<f32>(store[base + 7u]),
    bitcast<f32>(store[base + 8u]),  bitcast<f32>(store[base + 9u]),  bitcast<f32>(store[base + 10u]), bitcast<f32>(store[base + 11u]),
    bitcast<f32>(store[base + 12u]), bitcast<f32>(store[base + 13u]), bitcast<f32>(store[base + 14u]), bitcast<f32>(store[base + 15u]),
  );
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  let instanceCount = arrayLength(&srcInstances);
  if (i >= instanceCount) { return; }

  let id = srcInstances[i];
  if (store[id * STRIDE + VIS_LANE] == 0u) { return; }

  var lo = 0u;
  var hi = arrayLength(&drawCalls) - 1u;
  while (lo < hi) {
    let mid = (lo + hi + 1u) >> 1u;
    if (drawCalls[mid].firstInstance <= i) { lo = mid; } else { hi = mid - 1u; }
  }

  let boundsSlot = store[id * STRIDE + GEOM_LANE];
  if (boundsSlot != NO_BOUNDS) {
    let sphere = geomBounds[boundsSlot * 2u];
    if (sphere.w >= 0.0) {
      let local = loadMatrix(id * STRIDE);
      let center = local * vec4<f32>(sphere.xyz, 1.0);
      let sx = dot(local[0].xyz, local[0].xyz);
      let sy = dot(local[1].xyz, local[1].xyz);
      let sz = dot(local[2].xyz, local[2].xyz);
      let radius = sphere.w * sqrt(max(sx, max(sy, sz)));
      for (var p = 0u; p < 6u; p = p + 1u) {
        let plane = frustum.planes[p];
        if (dot(plane.xyz, center.xyz) + plane.w < -radius) { return; }
      }
    }
  }

  let slot = atomicAdd(&drawCalls[lo].instanceCount, 1u);
  dstInstances[drawCalls[lo].firstInstance + slot] = id;
}
`;var Tr=class{static extension={type:[W.WebGPUSystem],name:"compute3d"};_renderer;_zeroPipeline=null;_compactPipeline=null;_zeroBinds=new WeakMap;_compactBinds=new WeakMap;_jobs=[];_jobCount=0;_destroyed=!1;constructor(e){this._renderer=e}renderStart(){this._jobCount=0}dispatch(e,t,r,a,n,i,o,u){if(o===0||u===0)return;let s=this._jobs[this._jobCount];if(!s){const c=new Float32Array(24);s=this._jobs[this._jobCount]={drawCalls:null,src:null,dst:null,store:null,bounds:null,params:new Ee({data:c,usage:k.UNIFORM|k.COPY_DST,label:"mesh3d_cull_frustum",shrinkToFit:!1}),paramsF32:c,commandCount:0,instanceCount:0}}s.drawCalls=e,s.src=t,s.dst=r,s.store=a,s.bounds=n,s.paramsF32.set(i),s.params.update(),s.commandCount=o,s.instanceCount=u,this._jobCount++}renderEnd(){const e=this._jobCount;if(this._jobCount=0,e===0)return;const t=this._renderer.gpu.device,r=this._renderer.buffer,a=this._zeroPipeline||this._buildPipeline(t,Ir,"_zeroPipeline"),n=this._compactPipeline||this._buildPipeline(t,Pr,"_compactPipeline"),i=t.createCommandEncoder(),o=this._jobs,u=i.beginComputePass();u.setPipeline(a);for(let c=0;c<e;c++){const l=o[c],f=r.getGPUBuffer(l.drawCalls);u.setBindGroup(0,this._zeroBindGroup(t,a,f,l.commandCount)),u.dispatchWorkgroups(Math.ceil(l.commandCount/64))}u.end();const s=i.beginComputePass();s.setPipeline(n);for(let c=0;c<e;c++){const l=o[c];s.setBindGroup(0,this._compactBindGroup(t,n,l,r)),s.dispatchWorkgroups(Math.ceil(l.instanceCount/64))}s.end(),t.queue.submit([i.finish()]);for(let c=0;c<e;c++)o[c].drawCalls=null,o[c].src=null,o[c].dst=null,o[c].store=null,o[c].bounds=null}_zeroBindGroup(e,t,r,a){const n=this._zeroBinds.get(r);if(n&&n.commandCount===a)return n.bindGroup;const i=e.createBindGroup({layout:t.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:r,offset:0,size:a*20}}]});return this._zeroBinds.set(r,{bindGroup:i,commandCount:a}),i}_compactBindGroup(e,t,r,a){const n=a.getGPUBuffer(r.src),i=a.getGPUBuffer(r.dst),o=a.getGPUBuffer(r.drawCalls),u=a.getGPUBuffer(r.store),s=a.getGPUBuffer(r.bounds),c=a.getGPUBuffer(r.params),l=this._compactBinds.get(o);if(l&&l.src===n&&l.dst===i&&l.drawCalls===o&&l.store===u&&l.bounds===s&&l.params===c&&l.commandCount===r.commandCount&&l.instanceCount===r.instanceCount)return l.bindGroup;const f=e.createBindGroup({layout:t.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:n,offset:0,size:r.instanceCount*4}},{binding:1,resource:{buffer:i,offset:0,size:r.instanceCount*4}},{binding:2,resource:{buffer:o,offset:0,size:r.commandCount*20}},{binding:3,resource:{buffer:u}},{binding:4,resource:{buffer:s}},{binding:5,resource:{buffer:c}}]});return this._compactBinds.set(o,{bindGroup:f,src:n,dst:i,drawCalls:o,store:u,bounds:s,params:c,commandCount:r.commandCount,instanceCount:r.instanceCount}),f}_buildPipeline(e,t,r){const a=e.createShaderModule({code:t}),n=e.createComputePipeline({layout:"auto",compute:{module:a,entryPoint:"main"}});return this[r]=n,n}destroy(){if(!this._destroyed){this._destroyed=!0;for(const e of this._jobs)e.params?.destroy();this._jobs=null,this._zeroPipeline=null,this._compactPipeline=null,this._zeroBinds=new WeakMap,this._compactBinds=new WeakMap,this._jobCount=0}}};const K={name:"global",structs:{Renderable:We,RenderableInstance:ke,BoneMatrix:he,GeometryData:ge,Light:Ut},bindings:{global:{uGlobalLightParams:"vec4<f32>",uTime:"f32",uFogColor:"vec3<f32>",uDisplayExposure:"f32",uFogParams:"vec3<f32>",uExposure:"f32",uHemisphereSky:"vec3<f32>",uHemisphereGround:"vec3<f32>",uHemisphereUp:"vec3<f32>",uLightData:"array<vec4<f32>, 128>",uShadowData:`array<vec4<f32>, ${Ve*6}>`,uSampler:"sampler",uEnvironmentTexture:"texture_cube<f32>",uBrdfLutTexture:"texture_2d<f32>",uBrdfLutSampler:"sampler",uShadowMap:"texture_depth_2d_array",uShadowSampler:"sampler_comparison",uOpaqueDepthTexture:"texture_depth_2d",uOpaqueColorTexture:"texture_2d<f32>",uMaterialStorage:"texture_2d<u32>",uRenderableStorage:{type:"storage<Renderable>",visibility:"vertex"},uRenderableInstanceStorage:{type:"storage<RenderableInstance>",visibility:"vertex"},uBonePitStorage:{type:"storage<BoneMatrix>",visibility:"vertex"},uMorphStorage:{type:"storage<f32>",visibility:"vertex"},uGeometryStorage:{type:"storage<GeometryData>",visibility:"vertex"}}},gpu:{header:`
const LIGHT_DIRECTIONAL: f32 = 0.0;
const LIGHT_POINT: f32 = 1.0;
const LIGHT_SPOT: f32 = 2.0;
`}};function me(e,t){let r=e._gpuData[t.uid];if(!r){const a=jt(e._lightDataList.data,e._shadowDataList.data);t.ubo.ensureUniformGroup(a),a.buffer.autoGarbageCollect=!1;const n=new ie;n.addressMode="repeat";const i=new ie;i.compare="less";const o=new ie;o.addressMode="clamp-to-edge";const u=new $t({global:a,uSampler:n,uEnvironmentTexture:Ae.source,uBrdfLutTexture:Ge.EMPTY.source,uBrdfLutSampler:o,uShadowMap:ot.source,uShadowSampler:i,uOpaqueDepthTexture:nt,uOpaqueColorTexture:Ge.EMPTY.source,uMaterialStorage:at.source,uRenderableStorage:N,uRenderableInstanceStorage:N,uBonePitStorage:e._bonePit.bufferResource,uMorphStorage:N,uGeometryStorage:N,uInstanceStorage:N});r=new zt(a,u,{opaqueColor:{group:u,slot:"uOpaqueColorTexture"},opaqueDepth:{group:u,slot:"uOpaqueDepthTexture"},shadowMap:{group:u,slot:"uShadowMap"}}),e._gpuData[t.uid]=r}return r}var Rr=class{static extension={type:[W.WebGPUSystem],name:"lighting3d"};_renderer;constructor(e){this._renderer=e}update(e,t){const r=e.passByBit[z.SHADOW];r?.beginFrame(e);const{_lightDataList:a,environment:n}=e;a.reset();const i=me(e,this._renderer).globalUniformGroup.uniforms,o=i.uGlobalLightParams;o[0]=0,o[1]=0,o[2]=0,n!==null&&!(n instanceof Fe)&&st(n,i.uHemisphereSky,i.uHemisphereGround,i.uHemisphereUp);for(let u=0;u<t.length;u++){const s=t[u];if(s._worldVisible){if(s.type==="ambient"){const c=s,l=c.color,f=c.intensity;it(o,0,l,f);continue}a.count>=32||(r?.prepareShadow(s,e),a.add(s))}}o[3]=a.count}};const $r=`
  var<private> pos: array<vec2<f32>, 3> = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 3.0), vec2<f32>(3.0, -1.0));

  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) texCoord: vec2<f32>,
  };

  @vertex
  fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    output.texCoord = pos[vertexIndex] * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    return output;
  }

  @group(0) @binding(0) var imgSampler: sampler;
  @group(0) @binding(1) var img: texture_2d<f32>;

  @fragment
  fn fragmentMain(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
    return textureSample(img, imgSampler, texCoord);
  }
`;var Lr=class{static extension={type:[W.WebGPUSystem],name:"mipChain3d"};_renderer;_shaderModule=null;_sampler=null;_pipelines=Object.create(null);_cache=Object.create(null);constructor(e){this._renderer=e}generate(e){if(e.mipLevelCount<=1)return;const t=this._renderer.gpu.device,r=this._renderer.encoder.commandEncoder,a=this._pipeline(t,e.format),{bindGroups:n,dstViews:i}=this._cache[e.uid]||this._buildCacheEntry(e);for(let o=0;o<i.length;o++){const u=r.beginRenderPass({colorAttachments:[{view:i[o],loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:0}}]});u.setPipeline(a),u.setBindGroup(0,n[o]),u.draw(3),u.end()}}_buildCacheEntry(e){const t=this._renderer.gpu.device,r=this._pipeline(t,e.format),a=this._renderer.texture.getGpuSource(e),n=[],i=[],o=r.getBindGroupLayout(0);for(let s=1;s<e.mipLevelCount;s++)i.push(a.createView({baseMipLevel:s,mipLevelCount:1,dimension:"2d"})),n.push(t.createBindGroup({layout:o,entries:[{binding:0,resource:this._sampler},{binding:1,resource:a.createView({baseMipLevel:s-1,mipLevelCount:1,dimension:"2d"})}]}));const u={bindGroups:n,dstViews:i};return this._cache[e.uid]=u,u}_pipeline(e,t){const r=this._pipelines[t];if(r)return r;this._shaderModule||=e.createShaderModule({code:$r}),this._sampler||=e.createSampler({minFilter:"linear"});const a=e.createRenderPipeline({layout:"auto",vertex:{module:this._shaderModule,entryPoint:"vertexMain"},fragment:{module:this._shaderModule,entryPoint:"fragmentMain",targets:[{format:t}]}});return this._pipelines[t]=a,a}destroy(){this._shaderModule=null,this._sampler=null,this._pipelines=Object.create(null),this._cache=Object.create(null)}};function Ye(e){const t=e?8:4;return{name:e?"morphTargetNormal":"morphTarget",structs:{GeometryData:ge},bindings:{global:{uMorphStorage:"storage<f32>",uGeometryStorage:"storage<GeometryData>"}},gpu:{vertex:{input:`
        if (renderable.morphWeightIndex != 0u) {
          let geometryData = uGeometryStorage[renderable.geometryDataIndex];
          let vidLocal = vid - geometryData.baseVertex;
          let morphDeltaBase = geometryData.morphDeltaBase + vidLocal * geometryData.morphTargetCount * ${t}u;
          var morphedPosition = position.xyz;${e?`
          var morphedNormal = normal;`:""}
          for (var morphIndex = 0u; morphIndex < geometryData.morphTargetCount; morphIndex = morphIndex + 1u) {
            let weight = uMorphStorage[renderable.morphWeightIndex + morphIndex];
            if (weight != 0.0) {
              let deltaOffset = morphDeltaBase + morphIndex * ${t}u;
              morphedPosition += vec3<f32>(
                uMorphStorage[deltaOffset],
                uMorphStorage[deltaOffset + 1u],
                uMorphStorage[deltaOffset + 2u],
              ) * weight;${e?`
              morphedNormal += vec3<f32>(
                uMorphStorage[deltaOffset + 4u],
                uMorphStorage[deltaOffset + 5u],
                uMorphStorage[deltaOffset + 6u],
              ) * weight;`:""}
            }
          }
          position = vec4<f32>(morphedPosition, position.w);${e?`
          normal = normalize(morphedNormal);`:""}
        }
      `}}}}const Or=Ye(!1),Er=Ye(!0);function X(e){return Number.isInteger(e)?`${e}.0`:`${e}`}function Ar(e){const t=e.some(([a,n])=>a!==0||n!==0),r=[];return t&&r.push("      let texel = 1.0 / sp.z;"),e.forEach(([a,n],i)=>{const o=a===0&&n===0?"uv":`uv + vec2<f32>(${X(a)}, ${X(n)}) * texel`;r.push(`      ${i===0?"var s = ":"s += "}textureSampleCompareLevel(uShadowMap, uShadowSampler, ${o}, idx, d);`)}),r.push(e.length===1?"      return s;":`      return s / ${X(e.length)};`),r.join(`
`)}function ce(e){return{name:`shadow:${e}`,bindings:{global:{uShadowMap:"texture_depth_2d_array",uShadowSampler:"sampler_comparison",uShadowData:`array<vec4<f32>, ${Ve*6}>`}},gpu:{header:`
    fn sampleShadowAtIndex(
      idx: i32,
      worldPos: vec3<f32>,
      normal: vec3<f32>,
      NdotL: f32,
    ) -> f32 {
      let slot = idx * 6;
      let lightSpaceMatrix = mat4x4<f32>(
        global.uShadowData[slot],
        global.uShadowData[slot + 1],
        global.uShadowData[slot + 2],
        global.uShadowData[slot + 3],
      );
      let sp = global.uShadowData[slot + 4];

      let biasedPos = worldPos + normal * (sp.y * (1.0 - NdotL));
      let lsp = lightSpaceMatrix * vec4<f32>(biasedPos, 1.0);
      let proj = lsp.xyz / lsp.w;

      let uv = proj.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);

      if (any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0)) || proj.z < 0.0 || proj.z > 1.0) {
        return 1.0;
      }

      let d = proj.z - sp.x;

${Ar(kt[e])}
    }

    fn calculateShadow(
      shadowDataIndex: f32,
      cascadeCount: f32,
      worldPos: vec3<f32>,
      normal: vec3<f32>,
      NdotL: f32
    ) -> f32 {
      let baseIndex = i32(shadowDataIndex);

      if (baseIndex == -1) {
        return 1.0;
      }

      let last = i32(cascadeCount) - 1;

      if (last < 1) {
        return sampleShadowAtIndex(baseIndex, worldPos, normal, NdotL);
      }

      let viewDepth = -(camera.uViewMatrix * vec4<f32>(worldPos, 1.0)).z;
      let splits = global.uShadowData[baseIndex * 6 + 5].xyz;

      let crossed = step(splits, vec3<f32>(viewDepth));
      let cascadeIndex = i32(min(dot(crossed, vec3<f32>(1.0)), f32(last)));

      let shadow = sampleShadowAtIndex(baseIndex + cascadeIndex, worldPos, normal, NdotL);

      if (cascadeIndex == last) {
        return shadow;
      }

      let hot = vec3<f32>(f32(cascadeIndex == 0), f32(cascadeIndex == 1), f32(cascadeIndex == 2));
      let splitFar = dot(splits, hot);
      let splitNear = dot(splits, vec3<f32>(hot.y, hot.z, 0.0));

      let band = max((splitFar - splitNear) * ${X(Wt)}, 1e-4);
      let blend = saturate((viewDepth - splitFar + band) / band);

      if (blend <= 0.0) {
        return shadow;
      }

      let next = sampleShadowAtIndex(baseIndex + cascadeIndex + 1, worldPos, normal, NdotL);

      return mix(shadow, next, blend);
    }
  `}}}const Vr={hard:ce("hard"),pcf:ce("pcf"),"pcf-high":ce("pcf-high")},le={name:"skinning",attributes:{aJoints:"uint8x4",aWeights:"float32x4"},structs:{BoneMatrix:he},bindings:{global:{uBonePitStorage:"storage<BoneMatrix>"}},gpu:{vertex:{header:`
        fn getBoneRows(idx: u32, bonePitIndex: u32) -> mat3x4<f32> {
            return uBonePitStorage[(bonePitIndex) + idx].rows;
        }
      `,input:`
        var skinRows =
            getBoneRows(input.aJoints.x, renderable.bonePitIndex) * input.aWeights.x +
            getBoneRows(input.aJoints.y, renderable.bonePitIndex) * input.aWeights.y +
            getBoneRows(input.aJoints.z, renderable.bonePitIndex) * input.aWeights.z +
            getBoneRows(input.aJoints.w, renderable.bonePitIndex) * input.aWeights.w;

        position = vec4<f32>(dot(skinRows[0], position), dot(skinRows[1], position), dot(skinRows[2], position), position.w);
        normal = vec3<f32>(dot(skinRows[0].xyz, normal), dot(skinRows[1].xyz, normal), dot(skinRows[2].xyz, normal));
        tangent = vec3<f32>(dot(skinRows[0].xyz, tangent), dot(skinRows[1].xyz, tangent), dot(skinRows[2].xyz, tangent));
      `}}};function Fr(e,t){if(e.type==="mat2x2<f32>")return`mat2x2<f32>(bitcast<vec2<f32>>(${t}.xy), bitcast<vec2<f32>>(${t}.zw))`;const r=`${t}${e.swizzle}`;return e.scalar==="u32"?r:`bitcast<${e.type}>(${r})`}function Je(e){const t=[];t.push(`fn ${e.name}(index: u32) -> ${e.struct} {`),t.push(`  let base = ${e.base};`),t.push(`  var m: ${e.struct};`);for(const[r,a]of Ht(e.fields,e.read)){t.push(`  let t${r} = ${e.load(`base + ${r}`)};`);for(const n of a)t.push(`  m.${n.name} = ${Fr(n,`t${r}`)};`)}return t.push("  return m;"),t.push("}"),t.join(`
`)}function Nr(e){const{layout:t,loaded:r,varyings:a}=e,n={},i=["let instance = getInstance(inst.id);"],o=["var instance: Instance;"];for(const u of a){const s=t.struct[u],c=qt(u),l=s==="vec4<u32>"?`instance.${u}`:`bitcast<vec4<u32>>(instance.${u})`,f=s==="vec4<u32>"?`input.${c}`:`bitcast<${s}>(input.${c})`;n[c]="vec4<u32>",i.push(`output.${c} = ${l};`),o.push(`instance.${u} = ${f};`)}return{name:`instanceAccess:${t.key}`,interStage:n,bindings:{global:{uInstanceStorage:{type:"storage<vec4<u32>>",visibility:"vertex"}}},gpu:{vertex:{header:Je({name:"getInstance",struct:"Instance",fields:t.struct,read:r,base:`index * ${t.stride/4}u`,load:u=>`uInstanceStorage[${u}]`}),storeAccess:i.join(`
  `)},fragment:a.length?{storeAccess:o.join(`
  `)}:void 0}}}const Ur={collectData(e){if(!He(e.bits))return;const t=Kt(e.bits,"gpu",e.instanceLayout,e.template);e.bits=[...e.bits,Nr(t)]}},jr={float32:"f32",float32x2:"vec2<f32>",float32x3:"vec3<f32>",float32x4:"vec4<f32>",sint32:"i32",sint32x2:"vec2<i32>",sint32x3:"vec3<i32>",sint32x4:"vec4<i32>",uint32:"u32",uint32x2:"vec2<u32>",uint32x3:"vec3<u32>",uint32x4:"vec4<u32>",float16x2:"vec2<f32>",float16x4:"vec4<f32>",unorm8x2:"vec2<f32>",unorm8x4:"vec4<f32>",snorm8x2:"vec2<f32>",snorm8x4:"vec4<f32>",uint8x2:"vec2<u32>",uint8x4:"vec4<u32>",sint8x2:"vec2<i32>",sint8x4:"vec4<i32>",unorm16x2:"vec2<f32>",unorm16x4:"vec4<f32>",snorm16x2:"vec2<f32>",snorm16x4:"vec4<f32>",uint16x2:"vec2<u32>",uint16x4:"vec4<u32>",sint16x2:"vec2<i32>",sint16x4:"vec4<i32>"};function zr(e){const t=jr[e];return t||(T(`[compileAttributesWgsl] Unknown vertex format: "${e}"`),"vec4<f32>")}function kr(e){const t=Object.keys(e);if(t.length===0)return"";const r=[];r.push("struct VertexInput {");let a=0;for(const n of t){const i=zr(e[n]);r.push(`  @location(${a++}) ${n}: ${i},`)}return r.push("}"),r.join(`
`)}const Wr={collectData(e){e.data.attributes=Mr(e.bits)},injectCode(e){return{header:kr(e.data.attributes)}}};function Hr(e){return{groupIndex:e,bindingIndex:0,resources:Object.create(null),storages:Object.create(null),uniformBuffers:Object.create(null),uniformGroups:Object.create(null)}}function de(e,t,r){T(`[collectBindings] Binding "${e}" redefined with different type: "${r}" → "${t}". Keeping original.`)}function Kr(e,t,r){T(`[collectBindings] Bit "${e}" binding "${t}" has invalid storage type: "${r}". Expected format: storage<StructName>`)}function qr(e,t,r){T(`[collectBindings] Bit "${e}" binding "${t}" has invalid uniform buffer type: "${r}". Expected format: uniform<StructName>`)}function Yr(e,t){const r=Object.create(null);Ne(t).forEach(({name:n},i)=>{r[n]=Hr(i)});const a=Object.create(null);for(const n of e)if(n.structs)for(const[i,o]of Object.entries(n.structs))i in a||(a[i]=o);for(const n of e)if(n.bindings)for(const[i,o]of Object.entries(n.bindings)){if(!o)continue;const u=i in r;for(const{name:s,spec:c,uniformGroup:l}of Ue(o,i)){const f=ut(c);if(ct.has(f)){if(u){const m=r[i].resources;s in m?m[s]!==f&&de(s,f,m[s]):m[s]=f}}else if(lt(f)){if(u){const m=dt(f);if(!m){Kr(n.name,s,f);continue}const d=r[i].storages;s in d||(d[s]=m)}}else if(ft(f)){if(u){const m=pt(f);if(!m){qr(n.name,s,f);continue}const d=r[i].uniformBuffers;s in d?d[s]!==m&&de(s,m,d[s]):(d[s]=m,a[m]??={})}}else{const m=u?l:i,d=pe(m);d in a||(a[d]={});const p=a[d];p[s]&&p[s]!==f?de(s,f,p[s]):p[s]=f,u&&(r[i].uniformGroups[m]=!0)}}}return{structs:a,bindGroups:r}}function Jr(e){const{bindGroups:t}=e,r=Object.create(null);for(const a in t){const n=t[a],i=[];let o=n.bindingIndex;n.uniformGroups[a]&&i.push({name:a,binding:o++,kind:"uniform",type:pe(a)});for(const u in n.resources)i.push({name:u,binding:o++,kind:"resource",type:n.resources[u]});for(const u in n.storages)i.push({name:u,binding:o++,kind:"storage",type:n.storages[u]});for(const u in n.uniformBuffers)i.push({name:u,binding:o++,kind:"uniform",type:n.uniformBuffers[u]});for(const u in n.uniformGroups)u!==a&&i.push({name:u,binding:o++,kind:"uniform",type:pe(u)});r[a]={groupIndex:n.groupIndex,entries:i}}return r}function Xr(e){const{structs:t,bindGroups:r}=e;for(const i in r){const{uniformBuffers:o}=r[i];for(const u in o){const s=o[u];if(Object.keys(t[s]??{}).length===0)throw new Error(`[emitBindingsWgsl] Binding "${u}" is "uniform<${s}>", but no bit declares fields for a "${s}" struct.`)}}const a=[];for(const i in t){const o=t[i];a.push(`struct ${i} {`);for(const[u,s]of Object.entries(o))a.push(`  ${u}: ${s},`);a.push("}")}const n=Jr(e);for(const i in n){const{groupIndex:o,entries:u}=n[i];for(const s of u){const c=`@group(${o}) @binding(${s.binding})`;s.kind==="uniform"?a.push(`${c} var<uniform> ${s.name}: ${s.type};`):s.kind==="resource"?a.push(`${c} var ${s.name}: ${s.type};`):a.push(`${c} var<storage, read> ${s.name}: array<${s.type}>;`)}}return a.join(`
`)}const Zr={collectData(e){e.data.bindings=Yr(e.bits,e.template),e.data.structs=e.data.bindings.structs},injectCode(e){return{header:Xr(e.data.bindings)}}},Qr="{{fragmentWriteOutputs}}";function ea(e,t){const r=["struct Outputs {"];for(const a in e)r.push(`  ${a}: ${e[a]},`);r.push("}","","struct FragmentOutput {");for(let a=0;a<t.length;a++)e[t[a]]&&r.push(`  @location(${a}) ${t[a]}: ${e[t[a]]},`);return r.push("}"),r.join(`
`)}const ta={collectData(e){e.templateString.includes(Qr)&&(e.data.outputs=mt(e.bits))},injectCode(e){const t=e.data.outputs;if(!t)return{};const r=e.outputLocations;return{header:ea(t,r),fragmentDeclareOutputs:"var outputs: Outputs;",fragmentWriteOutputs:`return FragmentOutput(${r.filter(a=>t[a]).map(a=>`outputs.${a}`).join(", ")});`}}};function ra(e){return e.charAt(0).toUpperCase()+e.slice(1)}function ee(e,t){return`${e}${ra(t)}`}function aa(e){const t=Ke(e);for(const r of t)if(!(r==="header"||r==="textureGetters"||r.startsWith("vertex")||r.startsWith("fragment"))){const a=ee("vertex",r),n=ee("fragment",r);T(`[compileShader] Template slot {{${r}}} is not prefixed with "vertex" or "fragment". Did you mean {{${a}}} or {{${n}}}?`)}}const na={collectData(e){aa(e.templateString),e.data.headers=e.bits.map(t=>t.gpu?.header).filter(t=>!!t?.trim())},injectCode(e){return{header:e.data.headers.join(`

`)}}},oa=new Set(["position","frontFacing","sampleIndex","sampleMask"]);function Re(e){return e==="i32"||e==="u32"||e.includes("<i32>")||e.includes("<u32>")}function sa(e,t,r){T(`[compileInterStageWgsl] Inter-stage variable "${e}" redefined with different type: "${r}" → "${t}". Keeping original.`)}function ia(e){const t=Object.create(null);for(const r of e)if(r.interStage)for(const[a,n]of Object.entries(r.interStage))oa.has(a)||(a in t?t[a]!==n&&sa(a,n,t[a]):t[a]=n);return t}function ua(e){const t=[],r=Object.keys(e);t.push("struct VertexOutput {"),t.push("  @builtin(position) position: vec4<f32>,");let a=0;for(const n of r){const i=e[n],o=Re(i)?" @interpolate(flat)":"";t.push(`  @location(${a++})${o} ${n}: ${i},`)}t.push("}"),t.push(""),t.push("struct FragmentInput {"),t.push("  @builtin(position) position: vec4<f32>,"),t.push("  @builtin(front_facing) frontFacing: bool,"),a=0;for(const n of r){const i=e[n],o=Re(i)?" @interpolate(flat)":"";t.push(`  @location(${a++})${o} ${n}: ${i},`)}return t.push("}"),t.join(`
`)}const ca={collectData(e){e.data.interStage=ia(e.bits)},injectCode(e){return{header:ua(e.data.interStage)}}},la={collectData(e){e.data.overrides=Jt(e.bits)},injectCode(e){return{header:Yt(e.data.overrides)}}},da=/\{\{(.*?)\}\}/g;function fa(e){const t=new Set;for(const r of e)if(r)for(const a of r.matchAll(da))t.add(a[1]);return t}function pa(e,t){const r=Ke(e),a=fa(Object.values(t));for(const[n,i]of Object.entries(t))i&&/\S/.test(i)&&!r.has(n)&&!a.has(n)&&T(`[compileShader] Generated code for slot {{${n}}} but template doesn't have it. Slot names are prefixed with stage: vertex.input → {{vertexInput}}, fragment.end → {{fragmentEnd}}.`)}const ma={collectData(e){e.data.vertexSlots=Me(e.bits,"gpu","vertex"),e.data.fragmentSlots=Me(e.bits,"gpu","fragment")},injectCode(e){const t={};for(const[r,a]of Object.entries(e.data.vertexSlots))t[ee("vertex",r)]=a.join(`
`);for(const[r,a]of Object.entries(e.data.fragmentSlots))t[ee("fragment",r)]=a.join(`
`);return pa(e.templateString,t),t}};function ga(e,t){const r=Lt(e),a=Ot(r),n=Object.create(null);for(const i of t)if(i.bindings){for(const[o,u]of Object.entries(i.bindings))if(u)for(const{name:s,spec:c}of Ue(u,o))s in n||(n[s]=ht(c))}for(const i of r.groups){const o=n[i.name];if(!o||o==="both")continue;const u=a[i.group]?.find(s=>s.binding===i.binding);u&&(u.visibility=o==="vertex"?Q.VERTEX:Q.FRAGMENT)}return a}const ha=`diagnostic(off, derivative_uniformity);
`;function fe(e){const{bits:t,template:r,extraPlugins:a,instanceLayout:n,outputLocations:i=gt}=e,o=[Ur,la,Zr,Wr,ca,ta,na,ma],u=a?[...a,...o]:o,s={bits:Xt(t),template:r,templateString:r.gpu,data:{},instanceLayout:n,outputLocations:i},c=`${ha}${Zt(s,u)}`;return{vertex:{source:c,entryPoint:"mainVertex"},fragment:{source:c,entryPoint:"mainFragment"},structs:s.data.structs||{},gpuLayout:ga(c,s.bits),bits:s.bits}}function ba(e){return Je({name:"getMaterial",struct:"Material",fields:e,base:"i32(index)",load:t=>`textureLoad(uMaterialStorage, ${bt(t)}, 0)`})}const xa={injectCode(e){const t=e.data.structs?.Material;if(!t)return{};const r="var material = getMaterial(vMaterialIndex);";return{textureGetters:ba(t),vertexStoreAccess:r,fragmentStoreAccess:r}}};function va(e,t){const r=`uMaterialTexture${t}, uMaterialSampler${t}`;return[`fn ${e}Direct(uv: vec2<f32>) -> vec4<f32> {`,`  return textureSampleGrad(${r}, uv, vec2<f32>(0.0), vec2<f32>(0.0));`,"}",`fn ${e}(uv: vec2<f32>) -> vec4<f32> {`,`  return textureSample(${r}, uv);`,"}"]}function $e(e){return{collectData(t){t.bits.some(r=>r.name.startsWith("materialBindings:"))||t.bits.unshift(Qt(t.bits,e))},injectCode(t){let r=0;const a=[];for(const n of t.bits)if(n.textures)for(const i of n.textures){const o=`sample${i[0].toUpperCase()}${i.slice(1)}`;a.push(...va(o,r)),r++}return{textureGetters:a.join(`
`)}}}}const Sa=new Gt({}),ya=new Et({}),Le={direct:[Ie,$e("direct")],merged:[Ie,xa,$e("merged")]},wa=`


{{header}}
{{textureGetters}}
{{vertexHeader}}

@vertex
fn mainVertex(input: VertexInput,
  @builtin(instance_index) ii: u32,
  @builtin(vertex_index) vid: u32
) -> VertexOutput {
  var output: VertexOutput;

  var position: vec4<f32>;
  var normal = vec3<f32>(0.0, 0.0, 1.0);
  var tangent = vec3<f32>(0.0);
  var uv = vec2<f32>(0.0);
  
  let inst = uRenderableInstanceStorage[ii];
  let renderable = uRenderableStorage[inst.id];
  let vMaterialIndex = renderable.materialIndex;
  {{vertexStoreAccess}}

  let batchWorldMatrix = uRenderableStorage[0].transform;
  var modelMatrix = batchWorldMatrix * renderable.transform;

  {{vertexInput}}

  {{vertexBeforeTransform}}

  var worldPosition = modelMatrix * position;
  let modelMatrix3 = mat3x3<f32>(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz);

  let normalScale = 1.0 / vec3<f32>(
    dot(modelMatrix3[0], modelMatrix3[0]),
    dot(modelMatrix3[1], modelMatrix3[1]),
    dot(modelMatrix3[2], modelMatrix3[2])
  );
  var worldNormal = modelMatrix3 * (normal * normalScale);
  var clipPosition = camera.uViewProjectionMatrix * worldPosition;

  {{vertexAfterTransform}}

  {{vertexEnd}}

  output.position       = clipPosition;
  output.vPosition      = worldPosition.xyz;
  output.vNormal        = worldNormal;
  output.vUV            = uv;
  output.vMaterialIndex = renderable.materialIndex;

  return output;
}

@fragment
fn mainFragment(input: FragmentInput) -> FragmentOutput {
  {{fragmentDeclareOutputs}}
  var normal = normalize(input.vNormal);
  var albedo: vec3<f32> = vec3<f32>(1.0);
  var finalColor: vec3<f32>;
  var alpha: f32 = 1.0;

  let vMaterialIndex = input.vMaterialIndex;
  {{fragmentStoreAccess}}

  {{fragmentMaterial}}

  finalColor = albedo;

  {{fragmentLighting}}

  finalColor *= inputExposure(global.uExposure, global.uDisplayExposure);

  {{fragmentEnd}}

  outputs.color = vec4<f32>(finalColor * alpha, alpha);

  {{fragmentWriteOutputs}}
}
`,_a={name:"layout",overrideDefs:{HAS_UVS:{type:"u32",required:!0}},outputs:{color:"vec4<f32>"},interStage:{vNormal:"vec3<f32>",vUV:"vec2<f32>",vPosition:"vec3<f32>",vMaterialIndex:"u32"}},Ba={bindGroups:[{name:"global",ubo:!0},"camera","batch"],gpu:wa},Da=[[Q.VERTEX,"vertex"],[Q.FRAGMENT,"fragment"]];function Ca(e,t,r,a,n){const{maxSamplersPerShaderStage:i,maxSampledTexturesPerShaderStage:o}=r;for(const[u,s]of Da){let c=0,l=0,f=0,m=0;for(let S=0;S<e.length;S++){const D=e[S];if(D)for(const C of D)C.visibility&u&&(C.texture&&(c++,S===t&&f++),C.sampler&&(l++,S===t&&m++))}const d=l>i;if(!d&&c<=o)continue;const p=`${l} samplers`,h=`${i} (maxSamplersPerShaderStage)`,y=`${c} sampled textures`,x=`${o} (maxSampledTexturesPerShaderStage)`,[v,b,_]=d?[p,h,`Sampled textures: ${c} of ${x}`]:[y,x,`Samplers: ${l} of ${h}`],g=Mt(n);throw new Error(`[MaterialSystemGpu] ${a.material.constructor.name}'s shader binds ${v} in the ${s} stage, but this device allows ${b}. ${_}. The engine's globals take ${l-m} samplers and ${c-f} sampled textures, and the material's ${g.length} texture slots take ${m} samplers and ${f} sampled textures: ${g.join(", ")}. Turn off a feature group or remove a texture slot.`)}}var Ga=class{static extension={type:[W.WebGPUSystem],name:"material3d"};batcher=new Cr(this);_destroyed=!1;_renderer;_shaderCache=new Map;constructor(e){this._renderer=e}computeBatchKey(e,t){const r=e._passCache[t];return this._renderer.pipeline.getPipelineKey(e.geometry,r.shader.gpuProgram,r.state,r.topology,r.shader._overrides??ya)}compilePassShader(e,t){const r=fe({bits:[K,ue,...e],template:t});return _e(r.bits,t),J.from({gpu:r})}compileIsolatedShader(e,t,r){return J.from({gpu:fe({bits:e,template:t}),groups:r})}compileShader(e,t,r,a,n,i="direct"){const o=[];let u="";(e.includeGlobal??!0)&&(o.push(K),u+=`${K.name}|`),(e.includeCamera??!0)&&(o.push(ue),u+=`${ue.name}|`),o.push(...e.bitsGpu),u+=e.keyGpu;const s=er(t.geometry.attributes.aPosition.format);Be(s),o.push(s),u+=`|${s.name}`,t._morph&&(t.geometry.hasMorphNormals?(o.push(Er),u+="|morphN"):(o.push(Or),u+="|morph")),t.skeleton&&(Be(le),o.push(le),u+=`|${le.name}`),r.instanceStoreBuffer&&He(o)&&(u+=`|inst:${r.instanceStoreBuffer.layout.key}`),u+=`|${i}`;let c=this._shaderCache.get(u);if(!c){const l=fe({bits:o,template:e.template,extraPlugins:a,instanceLayout:r.instanceStoreBuffer?.layout,outputLocations:e.outputLocations});_e(l.bits,e.template),Ca(l.gpuLayout,Ne(e.template).findIndex(f=>f.name==="batch"),this._renderer.gpu.device.limits,t,l.bits),c={shader:J.from({gpu:l,overrides:e.overrides}),layout:xt(l.bits)},this._shaderCache.set(u,c)}return n&&(vt(c.layout,t.material),St(c.layout,t.material)),c.shader}ensureMaterial(e,t,r){const a=e.material;this._renderer.renderPipes.view3d.materialStoreBuffer.register(a);const n=this.compileShader(this._materialDescriptor(e,r),e,t,Le.direct,!0),i=a._passBit&z.MATERIAL_PASS_MASK,o=a._passes[i],u=o&&o.state||a.state,s=o&&o.topology||a.topology||e.geometry.topology,c=e._passCache[i];return c?(c.shader=n,c.mergedShader=null,c.state=u,c.topology=s,c.lastGeometryUid=-1):e._passCache[i]=new yt(n,u,s),n}ensureMergedShader(e,t,r){const a=e._passCache[e.material._passBit&z.MATERIAL_PASS_MASK];if(a.mergedShader)return a.mergedShader;const n=this._materialDescriptor(e,r);return a.mergedShader=this.compileShader(n,e,t,Le.merged,!0,"merged"),a.mergedShader}_materialDescriptor(e,t){const r=e.geometry,a=e.material,n=a.fog?t._fogBit:null,i=t._toneMappingBit,o=!!r.attributes.aColor&&a.vertexColors,u=tr(a,i,!!n||o),s=a.getPrimaryDescriptor(t),c=[K,_a,u];r.attributes.aNormal&&c.push(fr),r.attributes.aUV&&c.push(rr(r.attributes.aUV.format)),a.doubleSided&&c.push(ar),a.flatShading&&c.push(nr);const l=a.textures.normal;l&&l!==wt&&r.attributes.aUV&&c.push(r.attributes.aTangent?or:sr),o&&c.push(ir);const f=e.material.lit;e.billboardMode!=="none"&&c.push(ur(e.billboardMode,f));const m=!!r.attributes.aTangent;for(let h=0;h<s.bitsGpu.length;h++){const y=s.bitsGpu[h];c.push(m?_t(y):y)}a.alphaMode==="opaque"&&c.push(cr),n&&c.push(n),u!==lr&&i&&c.push(a._skipsToneCurve?Bt:i),f&&c.push(e.receiveShadow&&t._hasShadows?Vr[t.shadowFilter]:dr,Dt(i!==null));const d=t.passByBit[a._passBit&z.MATERIAL_PASS_MASK],p=Ct(c,d,!!s.template);return Sa.update({bitsGpu:c,template:s.template??Ba,overrides:{HAS_UVS:r.attributes.aUV?1:0,...s.overrides},outputLocations:p,includeGlobal:!1})}destroy(){if(!this._destroyed){this._destroyed=!0;for(const{shader:e}of this._shaderCache.values())e.destroy();this._shaderCache=null}}};const Xe=new Float32Array(24),Za=4e3;function Ze(e,t,r,a,n){if(n.lastVisibilityDirtyId!==r._visibilityDirtyId){if(n.lastVisibilityDirtyId=r._visibilityDirtyId,n.direct||t.view.count<4e3){re(t,r,null,n);return}e.dispatch(n.indirectDrawData.drawCallsBuffer,t.gpuData.instanceBuffer.buffer,n.survivors.buffer,r.storeBuffer.buffer,a,Xe,t.commandList.count,t.view.count)}}function re(e,t,r,a){const n=e.gpuData.instanceBuffer.data,i=a.survivors,o=a.indirectDrawData,u=i.data,s=o.drawCalls,c=e.commandList.count,l=e.view.count,f=t.storeBuffer.visible;r!==null&&t._ensureSpheres();const m=t.storeBuffer.boundingSpheres,d=r!==null,p=d?te(r,t.storeBuffer.data):Xe,h=p[0],y=p[1],x=p[2],v=p[3],b=p[4],_=p[5],g=p[6],S=p[7],D=p[8],C=p[9],P=p[10],G=p[11],w=p[12],M=p[13],B=p[14],U=p[15],j=p[16],I=p[17],R=p[18],$=p[19],ae=p[20],Qe=p[21],et=p[22],tt=p[23];let ve=!1;for(let L=0;L<c;L++){const ne=s[L*5+4],rt=L+1<c?s[(L+1)*5+4]:l;let Se=ne;for(let oe=ne;oe<rt;oe++){const se=n[oe];if(f[se]!==0){if(d){const H=se*4,O=m[H+3];if(O>=0){const E=m[H],A=m[H+1],V=m[H+2];if(h*E+y*A+x*V+v<-O||b*E+_*A+g*V+S<-O||D*E+C*A+P*V+G<-O||w*E+M*A+B*V+U<-O||j*E+I*A+R*V+$<-O||ae*E+Qe*A+et*V+tt<-O)continue}}u[Se++]=se}}const ye=Se-ne;s[L*5+1]!==ye&&(s[L*5+1]=ye,ve=!0)}ve&&a.countsDirtyId++,i.upload(l),a.direct||o.upload(c)}function Ma(e){const{pipe:t,bit:r,bindsMaterial:a,session:n,useBundles:i,sortBatch:o}=e;if(!i)return;const{view3d:u}=n,s=t.renderer.material3d.batcher,c=je(e.camera??u.camera).position;for(const l of u._meshBatches){if(!l.renderData._worldVisible)continue;const f=l.drawLists[r];if(!f)continue;const m=f.view;if(m.count===0||!(o?f.isDrawStale():f.nextBuild(u._updateTick)))continue;o&&o(m,l,c);const d=f.gpuData;d.instanceBuffer.populateIds(m),s.render({renderables:m,globalBindGroup:n.globalBindGroup,commandList:f.commandList,drawData:f.drawData,passBit:r,bindsMaterial:a,batch:l,view3d:u}),d.instanceBuffer.upload(m.count)}}function Ia(e){const{pipe:t,bit:r,cullResults:a,session:n,useBundles:i}=e;if(!i)return;const{view3d:o}=n,u=be("forward"),s=t.geometryDataStoreBuffer.buffer,c=(e.camera??o.camera).cullFrustum.planesData;a.removeDetached(o);for(const l of o._meshBatches){if(!l.renderData._worldVisible)continue;const f=l.drawLists[r];if(!f||f.view.count===0)continue;f.claimDrawBuilt();const m=f.view.count<=u,d=a.ensure(l);d.sync(f,m);const p=xe(l.cull,!m);if(p==="off"){Ze(t.renderer.compute3d,f,l,s,d);continue}if(p==="cpu"){re(f,l,c,d);continue}const h=te(c,l.storeBuffer.data);t.renderer.compute3d.dispatch(d.indirectDrawData.drawCallsBuffer,f.gpuData.instanceBuffer.buffer,d.survivors.buffer,l.storeBuffer.buffer,s,h,f.commandList.count,f.view.count)}}function Pa(e){const{pipe:t,bit:r,bindsMaterial:a,cullResults:n,session:i,useBundles:o,sortBatch:u}=e,{view3d:s}=i,c=t.renderer.encoder,l=t.renderer.material3d.batcher,f=t.renderer.gc.now,m=e.camera??s.camera,d=je(m),p=m.cullFrustum.planesData,h=t.geometryDataStoreBuffer.buffer,y=be("forward");o||n.removeDetached(s);let x=0;for(const v of s._meshBatches){if(!v.renderData._worldVisible)continue;const b=v.drawLists[r];if(!b)continue;const _=b.view;if(_.count===0){if(b.claimDrawEmpty(),o){const S=n.get(v);S&&(S.bundle=null,S.claimBundleRecorded(b,d.bindGroup))}continue}const g=n.ensure(v);if(o&&g.direct&&v.cull!=="off"){g.bundle=null,q(i,v,g),b.claimDrawBuilt(),b.commandList.replayDirect(c,g.indirectDrawData,d);continue}if(o){const S=g.bundle;(!S||g.isBundleStale(b,d.bindGroup)||!c.isBundleValid(S))&&(q(i,v,g),c.beginBundle(`view3d pass ${r} batch ${v.uid}`),g.direct?b.commandList.replayDirect(c,g.indirectDrawData,d):b.commandList.replay(c,t.renderer.buffer,g.indirectDrawData,d,0,b.commandList.bodyCount),g.bundle=c.endBundle(),g.claimBundleRecorded(b,d.bindGroup))}else{let S=!0;u?(u(_,v,d.position),S=b.isDrawStale()||b.isOrderStale()):b.nextBuild(s._updateTick,!0);const D=b.gpuData;S&&(D.instanceBuffer.populateIds(_),l.render({renderables:_,globalBindGroup:i.globalBindGroup,commandList:b.commandList,drawData:b.drawData,passBit:r,bindsMaterial:a,batch:v,view3d:s}),D.instanceBuffer.upload(_.count));const C=_.count<=y;g.sync(b,C),q(i,v,g);const P=xe(v.cull,!u&&!C);if(P==="gpu"){const G=te(p,v.storeBuffer.data);t.renderer.compute3d.dispatch(g.indirectDrawData.drawCallsBuffer,D.instanceBuffer.buffer,g.survivors.buffer,v.storeBuffer.buffer,h,G,b.commandList.count,b.view.count)}else re(b,v,P==="cpu"?p:null,g)}if(b.claimDrawBuilt(),o){const S=b.commandList;S.touch(f),Z[x++]=g.bundle,!g.direct&&S.count>S.bodyCount&&(q(i,v,g),S.replay(c,t.renderer.buffer,g.indirectDrawData,d,S.bodyCount))}else g.direct?b.commandList.replayDirect(c,g.indirectDrawData,d):b.commandList.replay(c,t.renderer.buffer,g.indirectDrawData,d)}x>0&&(c.executeBundle(Z),Z.length=0)}function q(e,t,r){e.globalBindGroup.setResource(t.storeBuffer.bufferResource,"uRenderableStorage"),e.globalBindGroup.setResource(r.survivors.bufferResource,"uRenderableInstanceStorage"),e.globalBindGroup.setResource(t.instanceStoreBuffer?.bufferResource??N,"uInstanceStorage")}const Z=[];At.register({clear:()=>{Z.length=0}});const Ta={name:"shadowGlobal",structs:{Renderable:We,RenderableInstance:ke,BoneMatrix:he,GeometryData:ge},bindings:{global:{uRenderableStorage:{type:"storage<Renderable>",visibility:"vertex"},uRenderableInstanceStorage:{type:"storage<RenderableInstance>",visibility:"vertex"},uBonePitStorage:{type:"storage<BoneMatrix>",visibility:"vertex"},uMorphStorage:{type:"storage<f32>",visibility:"vertex"},uGeometryStorage:{type:"storage<GeometryData>",visibility:"vertex"}}}},Ra={bindGroups:[{name:"global",ubo:!0},"camera","local"],gpu:`

{{header}}
{{vertexHeader}}

@vertex
fn mainVertex(
  input: VertexInput,
  @builtin(instance_index) ii: u32,
  @builtin(vertex_index) vid: u32
) -> VertexOutput {
  var output: VertexOutput;

  var position: vec4<f32>;

  let renderable = uRenderableStorage[uRenderableInstanceStorage[ii].id];
  let batchWorldMatrix = uRenderableStorage[0].transform;

  var normal = vec3<f32>(0.0);
  var tangent = vec3<f32>(0.0);

  {{vertexInput}}

  let worldPosition = batchWorldMatrix * renderable.transform * position;
  let clipPosition = camera.uViewProjectionMatrix * worldPosition;

  output.position = clipPosition;

  {{vertexEnd}}

  return output;
}

@fragment
fn mainFragment(input: FragmentInput){
}
`};var $a=class extends pr{_bundleRun=[];constructor(e){const t=It();t.depthTest=!0,t.depthMask=!0,t.culling=!0,t.clockwiseFrontFace=!1,t.blend=!1,super({renderer:e.renderer,name:"shadow",description:"Renders shadow-casting scene geometry into each light shadow map.",bit:z.SHADOW,shadowMapHandle:e.shadowMapHandle,descriptor:{shaderDescriptor:{bitsGpu:[Ta],template:Ra,includeGlobal:!1},state:t}})}_applyZRangeFix=!0;prepare(e){const{view3d:t,lights:r}=e;this._bindShadowSource(t,this.renderTarget.depthStencilTexture);const a=this.pipe.renderer.material3d.batcher,n=this.pipe.renderer.compute3d,i=this.pipe.geometryDataStoreBuffer.buffer;for(const o of t._meshBatches){if(!o.renderData._worldVisible)continue;const u=o.drawLists[this.bit];if(!u)continue;const s=u.gpuData,c=u.view;if(c.count===0){u.claimDrawEmpty();continue}u.nextBuild(t._updateTick)&&(u.claimDrawBuilt(),s.instanceBuffer.populateIds(c),a.render({renderables:c,globalBindGroup:e.globalBindGroup,commandList:u.commandList,drawData:u.drawData,passBit:this.bit,bindsMaterial:!1,batch:o,view3d:t}),s.instanceBuffer.upload(c.count))}for(let o=0;o<r.length;o++){const u=r[o],s=u._gpuShadowData;if(!s||(s.cullResults?.removeDetached(t),!De(u)))continue;const c=Ce(u),l=s.cascades,f=s.cullResults??=new Br,m=be("shadow");for(let d=0;d<c;d++){const p=l?.[d];if(!p||!p.needsRender)continue;const h=p.cameraData.frustum;for(const y of t._meshBatches){if(!y.renderData._worldVisible)continue;const x=y.drawLists[this.bit];if(!x||x.view.count===0)continue;if(d===0)for(let g=c;g<4;g++)f.remove(y,g);const v=x.view.count<=m,b=f.ensure(y,d);b.sync(x,v);const _=xe(y.cull,!v);if(_==="off")Ze(n,x,y,i,b);else if(_==="cpu")re(x,y,h.planesData,b);else{const g=te(h.planesData,y.storeBuffer.data);n.dispatch(b.indirectDrawData.drawCallsBuffer,x.gpuData.instanceBuffer.buffer,b.survivors.buffer,y.storeBuffer.buffer,i,g,x.commandList.count,x.view.count)}}}}}render(e){const{view3d:t,lights:r}=e,a=this.pipe.renderer,n=a.encoder,i=a.pipeline;i.setColorMask(0);for(const o of r){if(!De(o))continue;const u=this.getShadowGPUData(o).cullResults;if(!u)continue;const s=Ce(o);for(let c=0;c<s;c++){const l=this._cascadeSlot(o,c);if(!l.needsRender)continue;const f=o._shadowDataIndex+c,m=l.cameraData.bindGroup;a.renderTarget.bind({target:this.renderTarget,clear:!0,layer:f}),a.ubo.updateUniformGroup(l.cameraData.uniformGroup),l.cameraData.uniformGroup.buffer.autoGarbageCollect=!1;for(const d of t._meshBatches){if(!d.renderData._worldVisible)continue;const p=d.drawLists[this.bit];if(!p||p.view.count===0)continue;const h=u.get(d,c);if(!h)continue;if(h.direct&&d.cull!=="off"){h.bundle=null,e.globalBindGroup.setResource(d.storeBuffer.bufferResource,"uRenderableStorage"),e.globalBindGroup.setResource(h.survivors.bufferResource,"uRenderableInstanceStorage"),p.commandList.replayDirect(n,h.indirectDrawData,l.cameraData);continue}const y=h.bundle;if(!y||h.isBundleStale(p,m)||!n.isBundleValid(y)){const{globalBindGroup:v}=e;v.setResource(d.storeBuffer.bufferResource,"uRenderableStorage"),v.setResource(h.survivors.bufferResource,"uRenderableInstanceStorage"),n.beginBundle(`shadow cascade ${c} batch ${d.uid}`),h.direct?p.commandList.replayDirect(n,h.indirectDrawData,l.cameraData):p.commandList.replay(n,a.buffer,h.indirectDrawData,l.cameraData,0,p.commandList.bodyCount),h.bundle=n.endBundle(),h.claimBundleRecorded(p,m)}const x=p.commandList;x.touch(a.gc.now),this._bundleRun.push(h.bundle),!h.direct&&x.count>x.bodyCount&&(e.globalBindGroup.setResource(d.storeBuffer.bufferResource,"uRenderableStorage"),e.globalBindGroup.setResource(h.survivors.bufferResource,"uRenderableInstanceStorage"),x.replay(n,a.buffer,h.indirectDrawData,l.cameraData,x.bodyCount))}this._bundleRun.length>0&&(n.executeBundle(this._bundleRun),this._bundleRun.length=0)}this._completeShadowUpdate(o)}i.setColorMask(15),e.activeTarget=null}};const La=13421772,Oe=new Vt,Y=new ze,F={x:0,y:0};var Oa=class{static extension={type:[W.WebGPUPipes],name:"view3d"};renderer;_brdfLutTexture;_iblEnvironmentMap=new Map;_onEnvironmentDestroy=e=>{this._iblEnvironmentMap.get(e)?.source.unload(),this._iblEnvironmentMap.delete(e)};_viewport=new ze;_sortForwardByDistance=(e,t,r)=>{mr(e,t.storeBuffer.data,r)};_forwardOptions={pipe:this,bit:0,bindsMaterial:!1,cullResults:null,camera:null,session:null,useBundles:!1,sortBatch:void 0};materialStoreBuffer;_morphStoreBuffer=new gr;geometryDataStoreBuffer=new hr;atlasPool=br.from({rebaseIndices:!1});_managedViews;_destroyed=!1;_colorOutputDraw=null;constructor(e){this.renderer=e,this._managedViews=new xr(this.renderer),this.renderer.runners.contextChange.add(this)}contextChange(e){if(!e.device.features.has("indirect-first-instance"))throw new Error("@pixi/3d requires the WebGPU 'indirect-first-instance' feature (used by the batched indirect draw path).");this.materialStoreBuffer??=new vr({alignment:this.renderer.limits.minUniformBufferOffsetAlignment,rendererType:this.renderer.type})}createShadowPass(e){return new $a({renderer:this.renderer,shadowMapHandle:e.shadowMapHandle})}renderForward(e,t){Pa(this._fillForwardOptions(e,t,e.sort==="distance")),this._releaseForwardOptions()}prepareForward(e,t){if(!Pe(e))return;const r=this._fillForwardOptions(e,t,!1);Ma(r),Ia(r),this._releaseForwardOptions()}_fillForwardOptions(e,t,r){const a=this._forwardOptions;return a.useBundles=Pe(e),a.bit=e.bit,a.bindsMaterial=e.bindsMaterial,a.cullResults=e.cullResults,a.camera=e.camera,a.session=t,a.sortBatch=r?this._sortForwardByDistance:void 0,a}_releaseForwardOptions(){this._forwardOptions.cullResults=null,this._forwardOptions.camera=null,this._forwardOptions.session=null}renderGeometry(e,t,r){this.renderer.encoder.draw({geometry:e,shader:t,state:r})}setViewport(e){this.renderer.encoder.setViewport(e)}_depthClearShader=null;_depthClearState=null;clearDepth(e){this._depthClearShader||this._buildDepthClear();const{encoder:t,pipeline:r}=this.renderer;r.setColorMask(0),t.draw({geometry:Pt(),shader:this._depthClearShader,state:this._depthClearState}),r.setColorMask(15)}_buildDepthClear(){const e=new Dr;e.depthTest=!1,e.depthMask=!0,e.culling=!1,e.blend=!1,this._depthClearState=e,this._depthClearShader=J.from({gpu:{vertex:{entryPoint:"mainVertex",source:`
            struct VertexOutput { @builtin(position) position: vec4<f32> };

            @vertex
            fn mainVertex(@location(0) aPosition: vec2<f32>) -> VertexOutput {
              var output: VertexOutput;
              output.position = vec4<f32>(aPosition, 1.0, 1.0);
              return output;
            }
          `},fragment:{entryPoint:"mainFragment",source:`
            @fragment
            fn mainFragment() -> @location(0) vec4<f32> {
              return vec4<f32>(0.0, 0.0, 0.0, 1.0);
            }
          `}}})}copyColor(e,t,r){const{target:a,viewport:n}=e;if(!a.colorTexture)return;this.renderer.renderTarget.finishRenderPass();const i=t.frame,o=t.source.resolution;F.x=Math.round(i.x*o),F.y=Math.round(i.y*o),this.renderer.renderTarget.copyToTexture(a,t,Y.copyFrom(n),Y,F),r.activeTarget=null}outputColor(e,t,r,a){e.target.colorTexture&&(this.renderer.renderTarget.finishRenderPass(),(this._colorOutputDraw??=new Sr(this.renderer)).draw(this,e,t,a),r.activeTarget=null)}generateMips(e,t){const r=t.view3d._graph.getTexture(e,t).source;this.renderer.renderTarget.finishRenderPass(),t.activeTarget=null,this.renderer.mipChain3d.generate(r)}resolveColor(){}copyDepth(e,t,r){const{target:a,viewport:n}=e;a.depthStencilTexture&&(this.renderer.renderTarget.finishRenderPass(),F.x=0,F.y=0,this.renderer.renderTarget.copyDepthTexture(a,t,Y.copyFrom(n),Y,F),r.activeTarget=null)}validateRenderable(){return!1}addRenderable(e,t){this.renderer.renderPipes.batch.break(t),t.add(e)}updateRenderable(){}execute(e){if(!e.isRenderable)return;const t=me(e,this.renderer),r=this.renderer.renderTarget.renderTarget;e._ensureInitialized(this.renderer,t,r.colorTexture.source.resolution),this._managedViews.track(e);const a=e.environment;a&&(this._brdfLutTexture||=yr({renderer:this.renderer}),t.globalBindGroup.setResource(this._brdfLutTexture.source,"uBrdfLutTexture"));const n=this._prefilteredEnvironment(a);t.globalBindGroup.getResource("uEnvironmentTexture")!==n&&(t.globalBindGroup.setResource(n,"uEnvironmentTexture"),e._invalidateBundleCaches());const i=e.lights;if(e._meshSlots.count===0&&e._meshBatches.length===1)return;const o={view3d:e,lights:i,defaultTarget:r,defaultFrontFaceInverted:!1,activeTarget:null,needsDepthClear:!0,viewport:this._viewport,activeViewport:this._viewport,globalBindGroup:t.globalBindGroup,renderer:this.renderer};wr(e,this,o)&&(t.globalBindGroup.setResource(this.materialStoreBuffer.texture.source,"uMaterialStorage"),t.globalBindGroup.setResource(e._bonePit.bufferResource,"uBonePitStorage"),t.globalBindGroup.setResource(this._morphStoreBuffer.bufferResource,"uMorphStorage"),t.globalBindGroup.setResource(this.geometryDataStoreBuffer.bufferResource,"uGeometryStorage"),this.materialStoreBuffer.update(),this.geometryDataStoreBuffer.update(),this.atlasPool.update(),_r(this.atlasPool,this.materialStoreBuffer,t,this._morphStoreBuffer,this.geometryDataStoreBuffer)&&e._invalidateDrawCaches(),this.prepareView(o),e._graph.run(o))}destroy(){if(!this._destroyed){this._destroyed=!0,this._managedViews.destroy(),this._colorOutputDraw?.destroy(),this._colorOutputDraw=null,this._brdfLutTexture?.destroy(!0),this._brdfLutTexture=void 0;for(const[e,t]of this._iblEnvironmentMap)e.off("destroy",this._onEnvironmentDestroy),t.destroy(!0);this._iblEnvironmentMap=null,this.renderer.runners.contextChange.remove(this),this.materialStoreBuffer.destroy(),this.materialStoreBuffer=null,this._morphStoreBuffer.destroy(),this.geometryDataStoreBuffer.destroy(),this._depthClearShader?.destroy(),this._depthClearShader=null,this._depthClearState=null}}_prefilteredEnvironment(e){if(!(e instanceof Fe)||e.source.destroyed)return Ae.source;let t=this._iblEnvironmentMap.get(e.source);return t||(t=Tt({renderer:this.renderer,sourceTexture:e}),this._iblEnvironmentMap.set(e.source,t),e.source.once("destroy",this._onEnvironmentDestroy)),t.source}prepareView(e){const{view3d:t,lights:r}=e;this.renderer.lighting3d.update(t,r),this._updateGlobalUniforms(t)}_updateGlobalUniforms(e){const{fog:t}=e,r=me(e,this.renderer).globalUniformGroup,a=r.uniforms;if(a.uTime=performance.now()/1e3,a.uExposure=e.exposure,a.uDisplayExposure=Math.pow(e.exposure,1/2.2),t){Oe.setValue(t.color??La),Rt(a.uFogColor,0,Oe,e.exposure);const n=a.uFogParams;n[0]=t.near||0,n[1]=t.far||99999999,n[2]=t.density||0}r.update(),this.renderer.ubo.updateUniformGroup(r)}};Ft.add(Tr,Rr,Lr,Ga,Oa);export{Tr as ComputeSystemGpu,Za as GPU_VISIBILITY_MIN,Rr as LightingSystemGpu,Ga as MaterialSystemGpu,Lr as MipChainSystemGpu,$a as ShadowRenderPassGpu,Oa as View3DPipeGpu,Jr as buildWgslBindingMap,Yr as collectBindings,fe as compileWgslSource,Ia as computeForwardBatchesGpu,$e as createTexturesPluginGpu,Xr as emitBindingsWgsl,Je as generateWgslStructAccessor,me as getGlobalGpuData,K as globalBitGpu,Ur as instanceAccessPlugin,xa as materialTextureAccessPlugin,Or as morphTargetBitGpu,Er as morphTargetNormalBitGpu,ee as prefixSlotName,Ma as prepareForwardBatchesGpu,re as produceCpuCompaction,Ze as produceVisibilityCompaction,Pa as renderForwardBatchesGpu,Vr as shadowBitsGpu,Ta as shadowGlobalBitGpu,le as skinningBitGpu,Wr as wgslAttributesPlugin,Zr as wgslBindingsPlugin,ta as wgslFragmentOutputsPlugin,na as wgslHeadersPlugin,ca as wgslInterStagePlugin,la as wgslOverridesPlugin,ma as wgslStageSlotsPlugin};
