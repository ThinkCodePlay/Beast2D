/*!
 * @pixi/3d - v0.1.0
 * https://github.com/pixijs/3d
 * @pixi/3d is licensed under the MIT License.
 */
import{CASCADE_BLEND_FRACTION as e,CUBETEXTURE_EMPTY as t,ColorOutputDraw as n,DEFAULT_OUTPUT_LOCATIONS as r,DEPTH_EMPTY as i,GeometryAtlasPool as a,GeometryDataStoreBuffer as o,LightStructGl as s,MAX_SHADOW_SLOTS as c,MaterialDataStoreBuffer as l,Matrix4 as u,MeshPassCache as d,MorphStoreBuffer as f,NORMAL_MAP as p,RenderInstanceTexture as m,RenderPassBit as h,SHADOW_TAPS as g,ShaderDescriptor as _,ShadowDataStructGl as v,ShadowRenderPassBase as y,UINT_EMPTY as b,View3DGCRegistry as x,View3DGlobalData as S,addLinearRgb as C,addPassMaterialBits as w,alphaOpaqueBit as T,anisotropyTangentVariant as ee,assertBindGroups as E,assertBitIdentity as te,bindingFields as ne,bindingType as re,cachesDrawWork as ie,calculateDistancesFromStore as ae,calculateDistancesFromWorldMatrix as oe,cameraBit as D,capitalize as se,cascadeCountFor as ce,castsShadowThisFrame as le,collectFragmentOutputs as ue,collectOverrideDefs as de,collectSlotCode as fe,compileShader as pe,createGlobalUniformGroup as me,decodeToLinearBit as he,detectSharedCacheInvalidation as ge,displayColorSpaceBit as _e,doubleSidedNormalBit as ve,emitOverridesGlsl as ye,flatShadingBit as be,generateBrdfLut as xe,generateGroupMap as Se,generateIblSpecialCubemap as Ce,getCachedTemplateSlots as we,getCameraData as Te,getMaterialLayout as Ee,getMeshBillboardBit as De,getPositionBit as Oe,getUvsBit as ke,glTexelAddress as O,instanceFetchBitGl as Ae,instanceFetchMaterialBitGl as je,instanceVaryingName as Me,isStorageType as Ne,isUniformBufferType as Pe,layoutStructTexels as Fe,materialBindingsBit as Ie,materialStructPackPlugin as k,noShadowBit as Le,normalBit as Re,normalMappingBit as ze,parseUniformBufferType as Be,pipelineState as A,readsInstanceData as j,resolveBindGroups as Ve,resolveInstanceAccess as He,resolveShaderBits as Ue,selectColorSpaceBit as We,srgbEncodeBit as Ge,stateFor3D as Ke,tangentNormalMappingBit as qe,transformFrustumToBatch as Je,updateView3DScene as Ye,validateMaterialStruct as Xe,validateMaterialTextureSlots as Ze,vertexColorBit as Qe,writeHemisphere as $e,writeLinearRgb as et}from"./pixijs-3d.min.mjs";import{BindGroup as tt,CLEAR as M,Color as nt,CubeTexture as rt,ExtensionType as N,Rectangle as it,Shader as P,State as at,Texture as F,UniformGroup as ot,extensions as st,warn as I}from"pixi.js";const L={name:`globalGl`,structs:{Light:s,ShadowData:v},bindings:{global:{uGlobalLightParams:`vec4<f32>`,uTime:`f32`,uFogColor:`vec3<f32>`,uDisplayExposure:`f32`,uFogParams:`vec3<f32>`,uExposure:`f32`,uHemisphereSky:`vec3<f32>`,uHemisphereGround:`vec3<f32>`,uHemisphereUp:`vec3<f32>`,uEnvironmentMaxMipLevel:`f32`,uLightData:`array<vec4<f32>, 128>`,uShadowData:`array<vec4<f32>, ${c*6}>`,uEnvironmentTexture:`texture_cube<f32>`,uBrdfLutTexture:`texture_2d<f32>`,uMaterialStorage:`texture_2d<u32>`,uShadowMap:`texture_depth_2d_array`,uBonePitTexture:`texture_2d<f32>`,uOpaqueDepthTexture:`texture_2d<f32>`,uOpaqueColorTexture:`texture_2d<f32>`,uMorphTexture:`texture_2d<f32>`,uGeometryTexture:`texture_2d<u32>`}},gl:{header:`
const float LIGHT_DIRECTIONAL = 0.0;
const float LIGHT_POINT = 1.0;
const float LIGHT_SPOT = 2.0;
`}};function ct(){return{uEnvironmentMaxMipLevel:{value:0,type:`f32`}}}function R(e,n){let r=e._gpuData[n.uid];if(!r){let a=me(e._lightDataList.data,e._shadowDataList.data,ct()),o=new tt({global:a,uEnvironmentTexture:t.source,uBrdfLutTexture:F.EMPTY.source,uMaterialStorage:b.source,uShadowMap:i.source,uBonePitTexture:F.EMPTY.source,uOpaqueDepthTexture:F.EMPTY.source,uOpaqueColorTexture:F.EMPTY.source,uMorphTexture:F.EMPTY.source,uGeometryTexture:b.source,uMeshStoreTexture:b.source,uRenderInstanceTexture:b.source,batchTransform:n.material3d.batcher.batchTransform,uInstanceStoreTexture:b.source});r=new S(a,o,{opaqueColor:{group:o,slot:`uOpaqueColorTexture`},opaqueDepth:{group:o,slot:`uOpaqueDepthTexture`},shadowMap:{group:o,slot:`uShadowMap`}}),e._gpuData[n.uid]=r}return r}var lt=class{static extension={type:[N.WebGLSystem],name:`lighting3d`};_renderer;constructor(e){this._renderer=e}update(e,t){let n=e.passByBit[h.SHADOW];n?.beginFrame(e);let r=R(e,this._renderer).globalUniformGroup.uniforms,i=r.uGlobalLightParams;i[0]=0,i[1]=0,i[2]=0;let a=e.environment;a!==null&&!(a instanceof rt)&&$e(a,r.uHemisphereSky,r.uHemisphereGround,r.uHemisphereUp);let o=e._lightDataList;o.reset();for(let r=0;r<t.length;r++){let a=t[r];if(a._worldVisible){if(a.type===`ambient`){C(i,0,a.color,a.intensity);continue}o.count>=32||(n?.prepareShadow(a,e),o.add(a))}}i[3]=o.count}};function ut(e){let t=e?` * 2`:``;return{name:e?`morphTargetNormalGl`:`morphTargetGl`,bindings:{global:{uMorphTexture:`texture_2d<f32>`,uGeometryTexture:`texture_2d<u32>`}},gl:{vertex:{header:`
        vec4 fetchMorphTexel(int texel) {
          return texelFetch(uMorphTexture, ${O(`texel`)}, 0);
        }

        float fetchMorphWeight(int index) {
          return fetchMorphTexel(index >> 2)[index & 3];
        }

        uvec4 fetchGeometryMorphFacts(int geometryIndex) {
          int texel = geometryIndex * 2 + 1;
          return texelFetch(uGeometryTexture, ${O(`texel`)}, 0);
        }
      `,input:`
        if (morphData.x != 0.0) {
          uvec4 morphFacts = fetchGeometryMorphFacts(int(morphData.y));
          int morphTargetCount = int(morphFacts.y);
          int vidLocal = gl_VertexID - int(morphFacts.z);
          int morphDeltaTexel = int(morphFacts.x) / 4 + vidLocal * morphTargetCount${t};
          int morphWeightIndex = int(morphData.x);
          vec3 morphedPosition = position.xyz;${e?`
          vec3 morphedNormal = normal;`:``}
          for (int morphIndex = 0; morphIndex < morphTargetCount; morphIndex++) {
            float morphWeight = fetchMorphWeight(morphWeightIndex + morphIndex);
            if (morphWeight != 0.0) {
              morphedPosition += fetchMorphTexel(morphDeltaTexel + morphIndex${t}).xyz * morphWeight;${e?`
              morphedNormal += fetchMorphTexel(morphDeltaTexel + morphIndex * 2 + 1).xyz * morphWeight;`:``}
            }
          }
          position = vec4(morphedPosition, position.w);${e?`
          normal = normalize(morphedNormal);`:``}
        }
      `}}}}const dt=ut(!1),ft=ut(!0);function z(e){return Number.isInteger(e)?`${e}.0`:`${e}`}function pt(e){let t=e.some(([e,t])=>e!==0||t!==0),n=([e,t])=>e===0&&t===0?`uv`:`uv + vec2(${z(e)}, ${z(t)}) * texelSize`,r=[`      float currentDepth = depth - params.x;`];if(t&&r.push(`      float texelSize = 1.0 / params.z;`),r.push(`      float fl = float(layer);`,``),e.length===1)r.push(`      return texture(uShadowMap, vec4(${n(e[0])}, fl, currentDepth));`);else{let t=e.map(e=>`        texture(uShadowMap, vec4(${n(e)}, fl, currentDepth))`).join(` +
`);r.push(`      float shadow =\n${t};`,``,`      return shadow / ${z(e.length)};`)}return r.join(`
`)}function B(t){return{name:`shadowGl:${t}`,structs:{ShadowData:v},bindings:{global:{uShadowMap:`texture_depth_2d_array`,uShadowData:`array<vec4<f32>, ${c*6}>`}},gl:{header:`

    ShadowData getShadowData(int index) {
      int offset = index * 6;
      ShadowData sd;
      sd.lightSpaceMatrix = mat4(
        uShadowData[offset + 0],
        uShadowData[offset + 1],
        uShadowData[offset + 2],
        uShadowData[offset + 3]
      );
      sd.shadowParams = uShadowData[offset + 4];
      sd.cascadeSplits = uShadowData[offset + 5];
      return sd;
    }

    float sampleShadowLayer(int layer, mat4 lightSpaceMatrix, vec3 worldPos, vec3 normal, vec3 params, float NdotL) {
      vec3 biasedPos = worldPos + normal * (params.y * (1.0 - NdotL));
      vec4 lightSpacePos = lightSpaceMatrix * vec4(biasedPos, 1.0);
      vec3 projPos = lightSpacePos.xyz / lightSpacePos.w;

      vec2 uv = projPos.xy * 0.5 + 0.5;
      float depth = projPos.z * 0.5 + 0.5;

      vec3 uvd = vec3(uv, depth);
      if (any(notEqual(clamp(uvd, 0.0, 1.0), uvd))) {
        return 1.0;
      }

${pt(g[t])}
    }

    float calculateShadow(
      Light light,
      vec3 worldPos,
      vec3 normal,
      float NdotL
    ) {
      int baseIndex = int(light.shadowDataIndex);

      if (baseIndex == -1) {
        return 1.0;
      }

      ShadowData base = getShadowData(baseIndex);
      int last = int(base.shadowParams.w) - 1;

      if (last < 1) {
        return sampleShadowLayer(baseIndex, base.lightSpaceMatrix, worldPos, normal, base.shadowParams.xyz, NdotL);
      }

      float viewDepth = -(uViewMatrix * vec4(worldPos, 1.0)).z;
      vec3 splits = base.cascadeSplits.xyz;

      vec3 crossed = step(splits, vec3(viewDepth));
      int cascadeIndex = int(min(dot(crossed, vec3(1.0)), float(last)));

      int idx = baseIndex + cascadeIndex;
      ShadowData sd = getShadowData(idx);
      float shadow = sampleShadowLayer(idx, sd.lightSpaceMatrix, worldPos, normal, sd.shadowParams.xyz, NdotL);

      if (cascadeIndex == last) {
        return shadow;
      }

      vec3 hot = vec3(float(cascadeIndex == 0), float(cascadeIndex == 1), float(cascadeIndex == 2));
      float splitFar = dot(splits, hot);
      float splitNear = dot(splits, vec3(hot.y, hot.z, 0.0));

      float band = max((splitFar - splitNear) * ${z(e)}, 1e-4);
      float blend = clamp((viewDepth - splitFar + band) / band, 0.0, 1.0);

      if (blend <= 0.0) {
        return shadow;
      }

      ShadowData nd = getShadowData(idx + 1);
      float next = sampleShadowLayer(idx + 1, nd.lightSpaceMatrix, worldPos, normal, nd.shadowParams.xyz, NdotL);

      return mix(shadow, next, blend);
    }
  `}}}const mt={hard:B(`hard`),pcf:B(`pcf`),"pcf-high":B(`pcf-high`)},V={name:`skinningGl`,attributes:{aJoints:`uint8x4`,aWeights:`float32x4`},bindings:{global:{uBonePitTexture:`texture_2d<f32>`}},gl:{vertex:{header:`
        void getBoneRows(uint jointIndex, uint bonePitIndex, out vec4 r0, out vec4 r1, out vec4 r2) {
          int baseTexel = int(bonePitIndex + jointIndex) * 3;

          r0 = texelFetch(uBonePitTexture, ${O(`baseTexel`)}, 0);
          r1 = texelFetch(uBonePitTexture, ${O(`baseTexel + 1`)}, 0);
          r2 = texelFetch(uBonePitTexture, ${O(`baseTexel + 2`)}, 0);
        }
      `,input:`
        vec4 skinRow0, skinRow1, skinRow2;
        vec4 b0, b1, b2;

        getBoneRows(uint(aJoints.x), uint(bonePitIndex), b0, b1, b2);
        skinRow0 = b0 * aWeights.x;
        skinRow1 = b1 * aWeights.x;
        skinRow2 = b2 * aWeights.x;

        getBoneRows(uint(aJoints.y), uint(bonePitIndex), b0, b1, b2);
        skinRow0 += b0 * aWeights.y;
        skinRow1 += b1 * aWeights.y;
        skinRow2 += b2 * aWeights.y;

        getBoneRows(uint(aJoints.z), uint(bonePitIndex), b0, b1, b2);
        skinRow0 += b0 * aWeights.z;
        skinRow1 += b1 * aWeights.z;
        skinRow2 += b2 * aWeights.z;

        getBoneRows(uint(aJoints.w), uint(bonePitIndex), b0, b1, b2);
        skinRow0 += b0 * aWeights.w;
        skinRow1 += b1 * aWeights.w;
        skinRow2 += b2 * aWeights.w;

        position = vec4(dot(skinRow0, position), dot(skinRow1, position), dot(skinRow2, position), position.w);
        normal = vec3(dot(skinRow0.xyz, normal), dot(skinRow1.xyz, normal), dot(skinRow2.xyz, normal));
        tangent = vec3(dot(skinRow0.xyz, tangent), dot(skinRow1.xyz, tangent), dot(skinRow2.xyz, tangent));
      `}}},ht={float32:`float`,float32x2:`vec2`,float32x3:`vec3`,float32x4:`vec4`,sint32:`int`,sint32x2:`ivec2`,sint32x3:`ivec3`,sint32x4:`ivec4`,uint32:`uint`,uint32x2:`uvec2`,uint32x3:`uvec3`,uint32x4:`uvec4`,float16x2:`vec2`,float16x4:`vec4`,unorm8x2:`vec2`,unorm8x4:`vec4`,snorm8x2:`vec2`,snorm8x4:`vec4`,uint8x2:`uvec2`,uint8x4:`uvec4`,sint8x2:`ivec2`,sint8x4:`ivec4`,unorm16x2:`vec2`,unorm16x4:`vec4`,snorm16x2:`vec2`,snorm16x4:`vec4`,uint16x2:`uvec2`,uint16x4:`uvec4`,sint16x2:`ivec2`,sint16x4:`ivec4`};function gt(e){return ht[e]||(I(`[compileAttributesGlsl] Unknown vertex format: "${e}"`),`vec4`)}function _t(e,t,n){I(`[compileAttributesGlsl] Attribute "${e}" redefined with different format: "${n}" → "${t}". Keeping original.`)}function vt(e,t={}){let{useLocations:n=!0}=t,r=new Map;for(let t of e)if(t.attributes)for(let[e,n]of Object.entries(t.attributes))r.has(e)?r.get(e)!==n&&_t(e,n,r.get(e)):r.set(e,n);let i=[],a=0;for(let[e,t]of r){let r=gt(t);n?i.push(`layout(location = ${a++}) in ${r} ${e};`):i.push(`in ${r} ${e};`)}return i.join(`
`)}const yt={collectData(e){if(e.stage===`vertex`){let t=e.data.glsl??={};t.attributes??=vt(e.bits,{useLocations:e.glslOptions?.useLocations})}},injectCode(e){return e.stage===`vertex`?{header:e.data.glsl.attributes}:{}}},H={f32:`float`,i32:`int`,u32:`uint`,"vec2<f32>":`vec2`,"vec3<f32>":`vec3`,"vec4<f32>":`vec4`,"vec2<i32>":`ivec2`,"vec3<i32>":`ivec3`,"vec4<i32>":`ivec4`,"vec2<u32>":`uvec2`,"vec3<u32>":`uvec3`,"vec4<u32>":`uvec4`},U={...H,bool:`bool`,"mat2x2<f32>":`mat2`,"mat3x3<f32>":`mat3`,"mat4x4<f32>":`mat4`,"mat2x3<f32>":`mat2x3`,"mat2x4<f32>":`mat2x4`,"mat3x2<f32>":`mat3x2`,"mat3x4<f32>":`mat3x4`,"mat4x2<f32>":`mat4x2`,"mat4x3<f32>":`mat4x3`,"texture_2d<f32>":`sampler2D`,"texture_2d<u32>":`usampler2D`,"texture_2d<i32>":`isampler2D`,"texture_2d_array<f32>":`sampler2DArray`,"texture_3d<f32>":`sampler3D`,"texture_cube<f32>":`samplerCube`,texture_depth_2d:`sampler2DShadow`,texture_depth_2d_array:`sampler2DArrayShadow`,texture_depth_cube:`samplerCubeShadow`,texture_depth_cube_array:`samplerCubeArrayShadow`,sampler:``,sampler_comparison:``};function bt(e){let t=e.match(/^array<(.+),\s*(\d+)>$/);return t?{baseType:t[1],size:t[2]}:null}function xt(e){let t=bt(e);if(t){let e=U[t.baseType]??t.baseType;return e?{glslType:e,arraySize:t.size}:null}let n=U[e];return n===void 0?e:n||null}const St=new Set([`sampler2D`,`usampler2D`,`isampler2D`,`sampler2DArray`,`sampler3D`,`samplerCube`,`sampler2DShadow`,`sampler2DArrayShadow`,`samplerCubeShadow`,`samplerCubeArrayShadow`]);function W(e){return`u${se(e)}`}function G(e,t){return`${e}_${t}`}function Ct(e){let t=bt(e),n=t?t.baseType:e;return/^mat[234]x2</.test(n)?!t&&n===`mat2x2<f32>`:!t||n.startsWith(`vec4`)||n.startsWith(`mat`)}function wt(e){let t=U[e];return t===void 0?e:t||e}function K(e,t,n){I(`[collectBindingsGlsl] Binding "${e}" redefined with different type: "${n}" → "${t}". Keeping original.`)}function Tt(e,t){let n=Ve(t),r=Object.create(null);for(let{name:e}of n)r[e]={uniformGroups:Object.create(null),resources:Object.create(null),uniformBuffers:Object.create(null)};let i=Object.create(null);for(let t of e)if(t.structs)for(let[e,n]of Object.entries(t.structs))e in i||(i[e]=n);for(let t of e)if(t.bindings)for(let[e,n]of Object.entries(t.bindings)){if(!n)continue;let a=se(e),o=e in r;for(let{name:s,spec:c,uniformGroup:l}of ne(n,e)){let n=re(c);if(Ne(n))continue;if(Pe(n)){if(!o)continue;let a=Be(n);if(!a){I(`[collectBindingsGlsl] Bit "${t.name}" binding "${s}" has invalid uniform buffer type: "${n}". Expected format: uniform<StructName>`);continue}let c=r[e].uniformBuffers;s in c?c[s]!==a&&K(s,a,c[s]):(c[s]=a,i[a]??={});continue}let u=xt(n);if(!u)continue;let d=typeof u==`object`,f=d?u.glslType:u,p=d?u.arraySize:void 0;if(St.has(f)){if(o){let t=r[e].resources;s in t?t[s]!==f&&K(s,f,t[s]):t[s]=f}}else{let t=o?l:e;if(o){let n=r[e].uniformGroups[t]??=Object.create(null);s in n||(n[s]={glslType:f,arraySize:p})}if(t!==e)continue;a in i||(i[a]={});let c=i[a];c[s]&&c[s]!==n?K(s,n,c[s]):c[s]=n}}}return{groups:n,bindGroups:r,structs:i}}function Et(e,t,n){if(!Ct(n))throw Error(`[emitBindingsGlsl] Field "${t}" of uniform block "${e}" is "${n}", which std140 lays out differently from WGSL. A buffer-backed block takes scalars, vectors, mat2x2<f32>, matrices of vec3 or vec4 columns, and arrays of 16-byte elements.`);if(n===`mat2x2<f32>`)return[`  vec2 ${G(t,0)};`,`  vec2 ${G(t,1)};`];let r=xt(n);return[`  ${q(t,typeof r==`object`?r:{glslType:r})};`]}function q(e,t){return t.arraySize?`${t.glslType} ${e}[${t.arraySize}]`:`${t.glslType} ${e}`}function Dt(e,t){let{groups:n,bindGroups:r}=e;for(let e in r){let{uniformBuffers:n}=r[e];for(let e in n){let r=n[e];if(Object.keys(t[r]??{}).length===0)throw Error(`[emitBindingsGlsl] Binding "${e}" is "uniform<${r}>", but no bit declares fields for a "${r}" struct.`)}}let i=[];for(let e in t){let n=e.charAt(0).toLowerCase()+e.slice(1);if(r[n]?.uniformGroups[n])continue;let a=t[e];i.push(`struct ${e} {`);for(let[e,t]of Object.entries(a))i.push(`  ${wt(t)} ${e};`);i.push(`};`)}for(let{name:e,ubo:a}of n){let n=r[e],o=n.uniformGroups[e];if(o&&a){i.push(`layout(std140) uniform ${e} {`);for(let e in o)i.push(`  ${q(e,o[e])};`);i.push(`};`)}else if(o)for(let e in o)i.push(`uniform ${q(e,o[e])};`);for(let e in n.resources)i.push(`uniform ${n.resources[e]} ${e};`);for(let e in n.uniformBuffers){let r=t[n.uniformBuffers[e]];i.push(`layout(std140) uniform ${e} {`);for(let t in r)i.push(...Et(e,t,r[t]));i.push(`} ${W(e)};`)}for(let t in n.uniformGroups){if(t===e)continue;let r=n.uniformGroups[t];for(let e in r)i.push(`uniform ${q(e,r[e])};`)}}return i.join(`
`)}const Ot={collectData(e){let t=e.data.glsl??={};t.bindingGroups===void 0&&(t.bindingGroups=Tt(e.bits,e.template),e.data.structs=t.bindingGroups.structs)},injectCode(e){let t=e.data.glsl;return t.bindings??=Dt(t.bindingGroups,e.data.structs),{header:t.bindings}}};function kt(e){return`frag${e[0].toUpperCase()}${e.slice(1)}`}function At(e,t){let n=[`struct Outputs {`];for(let t in e)n.push(`  ${H[e[t]]} ${t};`);n.push(`};`,``);for(let r=0;r<t.length;r++)e[t[r]]&&n.push(`layout(location = ${r}) out ${H[e[t[r]]]} ${kt(t[r])};`);return n.join(`
`)}const jt={collectData(e){e.templateString.includes(`{{writeOutputs}}`)&&(e.data.outputs=ue(e.bits))},injectCode(e){let t=e.data.outputs;if(!t)return{};let n=e.outputLocations,r=[],i=[];for(let e in t)r.push(`${H[t[e]]}(0)`);for(let e=0;e<n.length;e++)t[n[e]]&&i.push(`${kt(n[e])} = outputs.${n[e]};`);return{header:At(t,n),declareOutputs:`Outputs outputs = Outputs(${r.join(`, `)});`,writeOutputs:i.join(`
`)}}},Mt={collectData(e){e.data.groupMap||(e.data.groupMap=Se(e.bits,e.template))}},Nt={collectData(e){e.data.headers||(e.data.headers=e.bits.map(e=>e.gl?.header).filter(e=>!!(e&&/\S/.test(e))))},injectCode(e){return{header:e.data.headers.join(`
`)}}},Pt=new Set([`position`,`frontFacing`,`sampleIndex`,`sampleMask`]);function Ft(e){return e===`i32`||e===`u32`||e.includes(`<i32>`)||e.includes(`<u32>`)}function It(e){return H[e]||(I(`[compileInterStageGlsl] Unknown inter-stage type: "${e}"`),`vec4`)}function Lt(e,t,n){I(`[compileInterStageGlsl] Inter-stage variable "${e}" redefined with different type: "${n}" → "${t}". Keeping original.`)}function Rt(e,t={}){let{useLocations:n=!0}=t,r=new Map;for(let t of e)if(t.interStage)for(let[e,n]of Object.entries(t.interStage))Pt.has(e)||(r.has(e)?r.get(e)!==n&&Lt(e,n,r.get(e)):r.set(e,n));let i=[],a=0;for(let[e,t]of r){let r=It(t),o=Ft(t)?`flat `:``;n?i.push(`layout(location = ${a++}) ${o}out ${r} ${e};`):i.push(`${o}out ${r} ${e};`)}let o=[];a=0;for(let[e,t]of r){let r=It(t),i=Ft(t)?`flat `:``;n?o.push(`layout(location = ${a++}) ${i}in ${r} ${e};`):o.push(`${i}in ${r} ${e};`)}return{vertex:i.join(`
`),fragment:o.join(`
`)}}const zt={collectData(e){let t=e.data.glsl??={};t.interStage??=Rt(e.bits,{useLocations:e.glslOptions?.useLocations})},injectCode(e){let t=e.data.glsl.interStage;return{header:e.stage===`vertex`?t.vertex:t.fragment}}},Bt={collectData(e){e.data.overrides=de(e.bits)},injectCode(e){let t=e.glslOptions?.overrides??{};return{header:ye(e.data.overrides,t)}}},J=`#version 300 es`,Vt={preCompile(e){let{templateString:t}=e;if(!t.includes(J)){I(`[compileShader] ${e.stage===`vertex`?`Vertex`:`Fragment`} template has no '${J}' line - highp precision will not be declared.`);return}e.templateString=t.replace(J,`${J}\nprecision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;
precision highp isampler2D;
precision highp sampler3D;
precision highp samplerCube;
precision highp sampler2DArray;
precision highp sampler2DShadow;
precision highp samplerCubeShadow;
precision highp sampler2DArrayShadow;`)}},Ht=/\{\{(.*?)\}\}/g;function Ut(e){let t=new Set;for(let n of Object.values(e))for(let e of n)if(e)for(let n of e.matchAll(Ht))t.add(n[1]);return t}function Wt(e,t,n){let r=we(e),i=Ut(t);for(let[e,a]of Object.entries(t))a.some(e=>e&&/\S/.test(e))&&!r.has(e)&&!i.has(e)&&I(`[compileShader] ${n===`vertex`?`Vertex`:`Fragment`} generated code for slot {{${e}}} but template doesn't have it.`)}const Gt={injectCode(e){if(!e.stage)return{};let t=fe(e.bits,`gl`,e.stage),n={};for(let[e,r]of Object.entries(t))n[e]=r.join(`
`);let r={};for(let[e,t]of Object.entries(n))r[e]=[t];return Wt(e.templateString,r,e.stage),n}};function Kt(e,t){if(e.type===`mat2x2<f32>`)return`mat2(uintBitsToFloat(${t}.xy), uintBitsToFloat(${t}.zw))`;let n=`${t}${e.swizzle}`;return e.scalar===`u32`?n:e.scalar===`i32`?`${e.type===`vec4<i32>`?`ivec4`:`int`}(${n})`:`uintBitsToFloat(${n})`}function Y(e){let t=[];t.push(`${e.struct} ${e.name}(uint index) {`),t.push(`  int base = ${e.base};`),t.push(`  ${e.struct} m;`);for(let[n,r]of Fe(e.fields,e.read)){t.push(`  uvec4 t${n} = ${e.load(`base + ${n}`)};`);for(let e of r)t.push(`  m.${e.name} = ${Kt(e,`t${n}`)};`)}return t.push(`  return m;`),t.push(`}`),t.join(`
`)}function qt(e){let{layout:t,loaded:n,varyings:r}=e,i={},a=[`Instance instance = getInstance(renderInstance.x);`],o=[`Instance instance;`];for(let e of r){let n=t.struct[e],r=Me(e),s=n===`vec4<f32>`?`floatBitsToUint(instance.${e})`:n===`vec4<i32>`?`uvec4(instance.${e})`:`instance.${e}`,c=n===`vec4<f32>`?`uintBitsToFloat(${r})`:n===`vec4<i32>`?`ivec4(${r})`:r;i[r]=`vec4<u32>`,a.push(`${r} = ${s};`),o.push(`instance.${e} = ${c};`)}return{name:`instanceAccess:${t.key}`,interStage:i,bindings:{global:{uInstanceStoreTexture:`texture_2d<u32>`}},gl:{vertex:{header:Y({name:`getInstance`,struct:`Instance`,fields:t.struct,read:n,base:`int(index) * ${t.stride/4}`,load:e=>`texelFetch(uInstanceStoreTexture, ${O(e)}, 0)`}),storeAccess:a.join(`
  `)},fragment:r.length?{storeAccess:o.join(`
  `)}:void 0}}}const Jt={collectData(e){if(!j(e.bits))return;let t=He(e.bits,`gl`,e.instanceLayout,e.template);e.bits=[...e.bits,qt(t)]}};function Yt(e,t,n){t&&/\S/.test(t)&&!e.includes(`{{header}}`)&&I(`[compileShader] ${n===`vertex`?`Vertex`:`Fragment`} template missing {{header}} slot - bindings, attributes, and inter-stage variables will not be injected.`)}function X(e){let{bits:t,template:n,extraPlugins:i,instanceLayout:a,outputLocations:o=r,...s}=e,c=Ue(t),l=[Jt,Vt,Mt,Bt,Ot,zt,jt,yt,Nt,Gt],u=i?[...i,...l]:l,d={bits:c,template:n,templateString:n.gl.vertex,data:{},stage:`vertex`,glslOptions:s,instanceLayout:a,outputLocations:o},f=pe(d,u);Yt(n.gl.vertex,d.data.headers.join(``),`vertex`);let p={bits:c,template:n,templateString:n.gl.fragment,data:d.data,stage:`fragment`,glslOptions:s,instanceLayout:a,outputLocations:o},m=pe(p,u);return Yt(n.gl.fragment,p.data.headers.join(``),`fragment`),{vertex:f,fragment:m,structs:p.data.structs??{},groupMap:p.data.groupMap,bits:p.bits}}function Xt(e){return Y({name:`getMaterial`,struct:`Material`,fields:e,base:`int(index)`,load:e=>`texelFetch(uMaterialStorage, ${O(e)}, 0)`})}const Zt={injectCode(e){let t=e.data.structs?.Material;return t?{textureGetters:Xt(t),storeAccess:`Material material = getMaterial(vMaterialIndex);`}:{}}},Z=W(`material`);function Qt(e){let t=[`Material getMaterial() {`,`  Material m;`];for(let n in e){let r=e[n]===`mat2x2<f32>`?`mat2(${Z}.${G(n,0)}, ${Z}.${G(n,1)})`:`${Z}.${n}`;t.push(`  m.${n} = ${r};`)}return t.push(`  return m;`,`}`),t.join(`
`)}const $t={injectCode(e){let t=e.data.structs?.Material;return t?{textureGetters:Qt(t),storeAccess:`Material material = getMaterial();`}:{}}},en={atlas:null,indexCount:void 0,firstIndex:void 0},tn=new Float32Array(24);var nn=class{batchTransform=new ot({uBatchWorldMatrix:{value:new u,type:`mat4x4<f32>`}},{isStatic:!0,ubo:!1});build(e){let{renderables:t,list:n,globalBindGroup:r,passBit:i,bindsMaterial:a}=e,o=t.count,s=n.commandList;if(o===0)return 0;s.clear(),this._ensureCapacity(n,o);let c=t.indices,l=t.items,u=n.glData,d=u.indexStaging,f=l[c[0]],p=f._passCache[i],m=p.shader,h=p.batchKey,g=f.geometry,_=A(h,p.state),v=p.topology,y=f.material,b=g._geometryAtlasAllocation||en,x=b.atlas?b.atlas.geometry:g,S=b.firstIndex,C=b.indexCount,w=0,T=y;a&&s.captureMaterialTextures(y),d[0]=f._storeIndex;for(let e=1;e<o;e++){f=l[c[e]],p=f._passCache[i],d[e]=f._storeIndex;let t=f.material,o=p.batchKey!==h;if(!o&&(!a||t===y))continue;if(!o&&y._textureSetId===t._textureSetId){y=t;continue}this._recordCommand(s,n.drawData,r,a?T._getMergedBindGroup():void 0,m,_,x,S,C,w,e-w,v,h,a?T._textureSetId:0,a),w=e;let u=t!==y;y=t,o&&(h=p.batchKey,g=f.geometry,m=p.shader,_=A(h,p.state),v=p.topology,b=g._geometryAtlasAllocation||en,x=b.atlas?b.atlas.geometry:g,S=b.firstIndex,C=b.indexCount),T=t,a&&u&&s.captureMaterialTextures(t)}return this._recordCommand(s,n.drawData,r,a?T._getMergedBindGroup():void 0,m,_,x,S,C,w,o-w,v,h,a?T._textureSetId:0,a),s.endBuild(),u.lastVisibilityDirtyId=-1,o}draw(e,t,n,r,i){let a=t.glData.indexTexture;if(!a)return;let o=r!==null&&n.cull!==`off`;(o||t.glData.lastVisibilityDirtyId!==n._visibilityDirtyId)&&this._compact(t,n,o?r:null,a),this.batchTransform.uniforms.uBatchWorldMatrix=n.renderData.worldTransform,this.batchTransform.update();let s=e.gl,c=e.shader,l=e.geometry,u=e.state,d=t.commandList,f=d.count,p=t.drawData.drawCalls;for(let e=0;e<f;e++){let t=e*5;if(p[t+1]===0||p[t]===0)continue;let n=d.commands[e];n.shader.groups[0]=n.globalBindGroup,n.shader.groups[1]=i.bindGroup,n.batchBindGroup&&(n.shader.groups[2]=n.batchBindGroup),c.bind(n.shader),l.bind(n.geometry,c._activeProgram),n.state&&u.set(n.state);let r=c._getProgramData(c._activeProgram).uniformData.uInstanceBase?.location;r!==void 0&&s.uniform1i(r,p[t+4]),l.draw(n.topology,p[t],p[t+2],p[t+1])}}_compact(e,t,n,r){let i=e.glData,a=e.commandList.count,o=e.drawData.drawCalls,s=e.view.count,c=t.storeBuffer.visible;n!==null&&t._ensureSpheres();let l=t.storeBuffer.boundingSpheres,u=i.indexStaging,d=r.data,f=n===null?null:Je(n.planesData,t.storeBuffer.data),p=f??tn,m=s,h=0;for(let e=0;e<a;e++){let t=o[e*5+4],n=e+1<a?o[(e+1)*5+4]:s,r=t;for(let e=t;e<n;e++){let t=u[e];if(c[t]!==0){if(f!==null){let e=t*4,n=l[e+3];if(n>=0){let t=l[e],r=l[e+1],i=l[e+2];if(p[0]*t+p[1]*r+p[2]*i+p[3]<-n||p[4]*t+p[5]*r+p[6]*i+p[7]<-n||p[8]*t+p[9]*r+p[10]*i+p[11]<-n||p[12]*t+p[13]*r+p[14]*i+p[15]<-n||p[16]*t+p[17]*r+p[18]*i+p[19]<-n||p[20]*t+p[21]*r+p[22]*i+p[23]<-n)continue}}d[r]!==t&&(d[r]=t,r<m&&(m=r),h=r+1),r++}}o[e*5+1]=r-t}r.upload(m,h),e.glData.lastVisibilityDirtyId=t._visibilityDirtyId}_ensureCapacity(e,t){let n=e.glData,r=n.indexTexture??=new m(Math.max(256,t));r.ensureCapacity(t),(!n.indexStaging||n.indexStaging.length<r.data.length)&&(n.indexStaging=new Uint32Array(r.data.length))}_recordCommand(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m){let h=e.next();h.geometry=o,h.shader=i,h.globalBindGroup=n,h.batchBindGroup=r,h.state=a,h.topology=d,h.batchKey=f,h.textureSetId=p,h.merged=m,e.captureGeometry(o);let g=(e.count-1)*5,_=t.ensureCapacity(e.count);_[g]=c??(o.indexCount||o.indexBuffer.data.length),_[g+1]=u,_[g+2]=s??0,_[g+3]=0,_[g+4]=l}};const rn=16777216,an={"point-list":0,"line-list":1,"line-strip":2,"triangle-list":3,"triangle-strip":4},on=new Map;let sn=0;function cn(e){let t=on.get(e);return t===void 0&&(t=sn++,on.set(e,t)),t}function Q(e,t,n){let r=((t.data*32+t._blendModeId)*8+an[n])*256+cn(t.polygonOffset);return e*rn+r}function ln(e,t,n){let r=[`vec4 ${e}Direct(vec2 uv) {`,`  return textureLod(uMaterialTexture${t}, uv, 0.0);`,`}`];return n&&r.push(`vec4 ${e}(vec2 uv) {`,`  return texture(uMaterialTexture${t}, uv);`,`}`),r}function $(e){return{collectData(t){t.bits.some(e=>e.name.startsWith(`materialBindings:`))||t.bits.unshift(Ie(t.bits,e))},injectCode(e){let t=0,n=[],r=e.stage===`fragment`;for(let i of e.bits)if(i.textures)for(let e of i.textures){let i=`sample${e[0].toUpperCase()}${e.slice(1)}`;n.push(...ln(i,t,r)),t++}return{textureGetters:n.join(`
`)}}}}const un=new _({}),dn={direct:[k,$t,$(`direct`)],merged:[k,Zt,$(`merged`)]},fn={name:`layout`,overrideDefs:{HAS_UVS:{type:`u32`,required:!0}},outputs:{color:`vec4<f32>`},interStage:{vNormal:`vec3<f32>`,vUV:`vec2<f32>`,vPosition:`vec3<f32>`,vMaterialIndex:`u32`}},pn={bindGroups:[{name:`global`,ubo:!0},`camera`,`batch`],gl:{vertex:`#version 300 es

{{header}}
{{textureGetters}}

void main() {
  mat4 modelMatrix;

  vec4 position;
  vec3 normal = vec3(0.0, 0.0, 1.0);
  vec3 tangent = vec3(0.0);
  vec2 uv = vec2(0.0);

  {{input}}

  {{storeAccess}}

  {{beforeTransform}}

  vec4 worldPosition = modelMatrix * position;
  mat3 modelMatrix3 = mat3(modelMatrix);

  vec3 normalScale = 1.0 / vec3(
    dot(modelMatrix3[0], modelMatrix3[0]),
    dot(modelMatrix3[1], modelMatrix3[1]),
    dot(modelMatrix3[2], modelMatrix3[2])
  );
  vec3 worldNormal = modelMatrix3 * (normal * normalScale);
  gl_Position = uViewProjectionMatrix * worldPosition;

  {{afterTransform}}

  {{end}}

  vPosition = worldPosition.xyz;
  vNormal   = worldNormal;
  vUV       = uv;
}`,fragment:`#version 300 es

{{header}}

{{textureGetters}}

void main() {
  {{declareOutputs}}
  vec3 normal = normalize(vNormal);
  vec3 albedo = vec3(1.0);
  vec3 finalColor;
  float alpha = 1.0;

  {{storeAccess}}

  {{material}}

  finalColor = albedo;

  {{lighting}}

  finalColor *= inputExposure(uExposure, uDisplayExposure);

  {{end}}

  outputs.color = vec4(finalColor * alpha, alpha);

  {{writeOutputs}}
}`}};var mn=class{static extension={type:[N.WebGLSystem],name:`material3d`};batcher=new nn;_destroyed=!1;_renderer;_shaderCache=new Map;constructor(e){this._renderer=e}computeBatchKey(e,t){let n=e._passCache[t];return Q(n.shader.uid,n.state,n.topology)}compilePassShader(e,t){let n=X({bits:[L,D,...e],template:t,useLocations:!1});return E(n.bits,t),P.from({gl:n,groups:{},groupMap:n.groupMap})}compileIsolatedShader(e,t,n){let r=X({bits:e,template:t,useLocations:!1});return P.from({gl:r,groups:n,groupMap:r.groupMap})}compileShader(e,t,n,r,i=!1,a={useLocations:!1},o=`direct`){let s=[],c=``;(e.includeGlobal??!0)&&(s.push(L),c+=`${L.name}|`),(e.includeCamera??!0)&&(s.push(D),c+=`${D.name}|`),s.push(...e.bitsGl),c+=e.keyGl;let l=Oe(t.geometry.attributes.aPosition.format);te(l),s.push(l),c+=`|${l.name}`,t._morph&&(t.geometry.hasMorphNormals?(s.push(ft),c+=`|morphN`):(s.push(dt),c+=`|morph`)),t.skeleton&&(te(V),s.push(V),c+=`|${V.name}`),n.instanceStoreBuffer&&j(s)&&(c+=`|inst:${n.instanceStoreBuffer.layout.key}`),c+=`|${o}`;let u=this._shaderCache.get(c);if(!u){let t=X({bits:s,template:e.template,extraPlugins:r,instanceLayout:n.instanceStoreBuffer?.layout,...a,overrides:e.overrides,outputLocations:e.outputLocations});E(t.bits,e.template),u={shader:P.from({gl:t,groups:{},overrides:e.overrides,groupMap:t.groupMap}),layout:Ee(t.bits)},this._shaderCache.set(c,u)}return i&&(Ze(u.layout,t.material),Xe(u.layout,t.material)),u.shader}ensureMaterial(e,t,n){let r=e.material;this._renderer.renderPipes.view3d.materialStoreBuffer.register(r);let i=this.compileShader(this._materialDescriptor(e,n),e,t,dn.merged,!0,{useLocations:!1},`merged`),a=r._passBit&h.MATERIAL_PASS_MASK,o=r._passes[a],s=o&&o.state||r.state,c=o&&o.topology||r.topology||e.geometry.topology,l=e._passCache[a];return l?(l.shader=i,l.state=s,l.topology=c,l.lastGeometryUid=-1):e._passCache[a]=new d(i,s,c),i}_materialDescriptor(e,t){let n=e.geometry,r=e.material,i=r.fog?t._fogBit:null,a=t._toneMappingBit,o=!!n.attributes.aColor&&r.vertexColors,s=We(r,a,!!i||o),c=r.getPrimaryDescriptor(t),l=[L,fn,je,s];n.attributes.aNormal&&l.push(Re),n.attributes.aUV&&l.push(ke(n.attributes.aUV.format)),r.doubleSided&&l.push(ve),r.flatShading&&l.push(be);let u=r.textures.normal;u&&u!==p&&n.attributes.aUV&&l.push(n.attributes.aTangent?qe:ze),o&&l.push(Qe);let d=e.material.lit;e.billboardMode!==`none`&&l.push(De(e.billboardMode,d));let f=!!n.attributes.aTangent;for(let e=0;e<c.bitsGl.length;e++){let t=c.bitsGl[e];l.push(f?ee(t):t)}r.alphaMode===`opaque`&&l.push(T),i&&l.push(i),s!==_e&&a&&l.push(r._skipsToneCurve?Ge:a),d&&l.push(e.receiveShadow&&t._hasShadows?mt[t.shadowFilter]:Le,he(a!==null));let m=t.passByBit[r._passBit&h.MATERIAL_PASS_MASK],g=w(l,m,!!c.template);return un.update({bitsGl:l,template:c.template??pn,overrides:{HAS_UVS:+!!n.attributes.aUV,...c.overrides},outputLocations:g,includeGlobal:!1})}destroy(){if(!this._destroyed){this._destroyed=!0;for(let{shader:e}of this._shaderCache.values())e.destroy();this._shaderCache=null}}};function hn(e){let{pipe:t,bit:n,bindsMaterial:r,session:i,alwaysRebuild:a,sortBatch:o}=e,{view3d:s}=i,c=t.renderer.material3d.batcher,l=e.camera??s.camera,u=Te(l),d=l.cullFrustum;u.setViewport(i.activeViewport);for(let e of s._meshBatches){if(!e.renderData._worldVisible)continue;let l=e.drawLists[n];if(!l)continue;let f=l.view;if(f.count===0)continue;let p;o?(o(f,e,u.position),p=l.isDrawStale()||l.isOrderStale()):p=l.nextBuild(s._updateTick,a),p&&(l.claimDrawBuilt(),c.build({renderables:f,list:l,globalBindGroup:i.globalBindGroup,passBit:n,bindsMaterial:r})),i.globalBindGroup.setResource(e.storeBuffer.texture.source,`uMeshStoreTexture`),l.glData.indexTexture&&i.globalBindGroup.setResource(l.glData.indexTexture.texture.source,`uRenderInstanceTexture`),i.globalBindGroup.setResource(e.instanceStoreBuffer?.texture.source??b.source,`uInstanceStoreTexture`),c.draw(t.renderer,l,e,d,u)}}const gn={name:`shadowGlobalGl`,bindings:{global:{uBonePitTexture:`texture_2d<f32>`,uMorphTexture:`texture_2d<f32>`,uGeometryTexture:`texture_2d<u32>`}}},_n={bindGroups:[{name:`global`,ubo:!0},`camera`],gl:{vertex:`#version 300 es

{{header}}

void main() {
  mat4 modelMatrix;

  vec4 position;
  vec3 normal = vec3(0.0);
  vec3 tangent = vec3(0.0);

  {{input}}

  vec4 worldPosition = modelMatrix * position;
  gl_Position = uViewProjectionMatrix * worldPosition;

  {{end}}
}`,fragment:`#version 300 es
out vec4 fragColor;

{{header}}

void main() {
    fragColor = vec4(0.);
}`}};var vn=class extends y{constructor(e){let t=Ke();t.depthTest=!0,t.culling=!0,t.clockwiseFrontFace=!0,t.blend=!1,super({renderer:e.renderer,name:`shadow`,description:`Renders shadow-casting scene geometry into each light shadow map.`,bit:h.SHADOW,shadowMapHandle:e.shadowMapHandle,descriptor:{shaderDescriptor:{bitsGl:[gn,Ae],template:_n,includeGlobal:!1},state:t}})}_applyZRangeFix=!1;render(e){let{view3d:t,lights:n}=e;if(!n.find(e=>e.canCastShadow))return;this._bindShadowSource(t,this.renderTarget.depthStencilTexture),this.pipe.renderer.colorMask.setMask(0);let r=this.pipe.renderer.material3d.batcher,i=e.globalBindGroup,a=n.some(e=>e.castShadow&&e._gpuShadowData&&e._shadowDataIndex>=0);for(let e of t._meshBatches){if(!e.renderData._worldVisible)continue;let n=e.drawLists[this.bit];if(!n)continue;let o=n.view;o.count!==0&&a&&n.nextBuild(t._updateTick)&&(n.claimDrawBuilt(),r.build({renderables:o,list:n,globalBindGroup:i,passBit:this.bit,bindsMaterial:!1}))}for(let e of n){if(!le(e))continue;let n=ce(e);for(let a=0;a<n;a++){let n=this._cascadeSlot(e,a);if(!n.needsRender)continue;let o=n.cameraData.frustum;this.pipe.renderer.renderTarget.bind({target:this.renderTarget,clear:!0,layer:e._shadowDataIndex+a});for(let e of t._meshBatches){if(!e.renderData._worldVisible)continue;let t=e.drawLists[this.bit];t&&t.view.count!==0&&(i.setResource(e.storeBuffer.texture.source,`uMeshStoreTexture`),t.glData.indexTexture&&i.setResource(t.glData.indexTexture.texture.source,`uRenderInstanceTexture`),r.draw(this.pipe.renderer,t,e,o,n.cameraData))}}this._completeShadowUpdate(e)}this.pipe.renderer.colorMask.setMask(15),e.activeTarget=null}};const yn=new nt;var bn=class{static extension={type:[N.WebGLPipes],name:`view3d`};renderer;_brdfLutTexture;_destroyed=!1;_colorOutputDraw=null;_iblEnvironmentMap=new Map;_onEnvironmentDestroy=e=>{this._iblEnvironmentMap.get(e)?.source.unload(),this._iblEnvironmentMap.delete(e)};_viewport=new it;_sortForwardByDistance=(e,t,n)=>{t.isUserBatch?ae(e,n,t.storeBuffer.data,t.renderData.worldTransform):oe(e,n)};_forwardOptions={pipe:this,bit:0,bindsMaterial:!1,camera:null,session:null,alwaysRebuild:!0,sortBatch:void 0};materialStoreBuffer;_morphStoreBuffer=new f;geometryDataStoreBuffer=new o;atlasPool=a.from({rebaseIndices:!0});_managedViews;constructor(e){this.renderer=e,this._managedViews=new x(e),e.runners.contextChange.add(this)}contextChange(){this.materialStoreBuffer??=new l({alignment:this.renderer.limits.minUniformBufferOffsetAlignment,rendererType:this.renderer.type})}createShadowPass(e){return new vn({renderer:this.renderer,shadowMapHandle:e.shadowMapHandle})}prepareForward(e,t){}renderForward(e,t){let n=this._forwardOptions;n.bit=e.bit,n.bindsMaterial=e.bindsMaterial,n.camera=e.camera,n.session=t,n.alwaysRebuild=!ie(e),n.sortBatch=e.sort===`distance`?this._sortForwardByDistance:void 0,hn(n),n.camera=null,n.session=null}renderGeometry(e,t,n){this.renderer.encoder.draw({geometry:e,shader:t,state:n})}setViewport(e){this.renderer.gl.viewport(e.x,e.y,e.width,e.height)}_depthClearState=null;clearDepth(e){if(!this._depthClearState){let e=new at;e.depthMask=!0,e.depthTest=!1,e.culling=!1,e.blend=!1,this._depthClearState=e}let t=this.renderer.gl,n=e.activeViewport;this.renderer.state.set(this._depthClearState),t.enable(t.SCISSOR_TEST),t.scissor(n.x,n.y,n.width,n.height),this.renderer.renderTarget.clear(this.renderer.renderTarget.renderTarget,M.DEPTH),t.disable(t.SCISSOR_TEST)}copyColor(e,t,n){let{target:r,viewport:i}=e;if(!r.colorTexture)return;let a=t.frame,o=t.source.resolution;this.renderer.renderTarget.copyToTexture(r,t,{x:i.x,y:i.y},{width:i.width,height:i.height},{x:Math.round(a.x*o),y:Math.round(a.y*o)}),n.activeTarget=null}outputColor(e,t,r,i){let{target:a}=e;if(!a.colorTexture)return;let o=this.renderer.renderTarget;(this._colorOutputDraw??=new n(this.renderer)).draw(this,e,t,i),o.finishRenderPass(),r.activeTarget=null}generateMips(e,t){let n=t.view3d._graph.getTexture(e,t).source;this.renderer.renderTarget.bind({target:t.defaultTarget,clear:M.NONE}),t.activeTarget=null,n.updateMipmaps()}resolveColor(){this.renderer.renderTarget.finishRenderPass()}copyDepth(e,t,n){let{target:r,viewport:i}=e;r.depthStencilTexture&&(this.renderer.renderTarget.copyDepthTexture(r,t,{x:i.x,y:i.y},{width:i.width,height:i.height},{x:0,y:0}),n.activeTarget=null)}validateRenderable(){return!1}addRenderable(e,t){this.renderer.renderPipes.batch.break(t),t.add(e)}updateRenderable(){}execute(e){if(!e.isRenderable)return;let t=R(e,this.renderer),n=this.renderer.renderTarget.renderTarget;e._ensureInitialized(this.renderer,t,n.colorTexture.source.resolution),this._managedViews.track(e);let r=e.environment;r&&(this._brdfLutTexture||=xe({renderer:this.renderer}),t.globalBindGroup.setResource(this._brdfLutTexture.source,`uBrdfLutTexture`));let i=this._prefilteredEnvironment(r);t.globalBindGroup.setResource(i,`uEnvironmentTexture`),t.globalUniformGroup.uniforms.uEnvironmentMaxMipLevel=i.mipLevelCount-1;let a=e.lights;if(e._meshSlots.count===0&&e._meshBatches.length===1)return;let o={view3d:e,lights:a,defaultTarget:n,defaultFrontFaceInverted:!1,activeTarget:null,needsDepthClear:!0,viewport:this._viewport,activeViewport:this._viewport,globalBindGroup:t.globalBindGroup,globalUniformGroup:t.globalUniformGroup,renderer:this.renderer};Ye(e,this,o)&&(t.globalBindGroup.setResource(e._bonePit.texture.source,`uBonePitTexture`),t.globalBindGroup.setResource(this._morphStoreBuffer.texture.source,`uMorphTexture`),t.globalBindGroup.setResource(this.geometryDataStoreBuffer.texture.source,`uGeometryTexture`),this.atlasPool.update(),this.materialStoreBuffer.update(),this.geometryDataStoreBuffer.update(),ge(this.atlasPool,this.materialStoreBuffer,t,this._morphStoreBuffer)&&e._invalidateDrawCaches(),t.globalBindGroup.setResource(this.materialStoreBuffer.texture.source,`uMaterialStorage`),this.prepareView(o),e._graph.run(o))}destroy(){if(!this._destroyed){this._destroyed=!0,this._managedViews.destroy(),this._colorOutputDraw?.destroy(),this._colorOutputDraw=null,this._brdfLutTexture?.destroy(!0),this._brdfLutTexture=void 0;for(let[e,t]of this._iblEnvironmentMap)e.off(`destroy`,this._onEnvironmentDestroy),t.destroy(!0);this._iblEnvironmentMap=null,this.renderer.runners.contextChange.remove(this),this.materialStoreBuffer.destroy(),this.materialStoreBuffer=null,this._morphStoreBuffer.destroy(),this.geometryDataStoreBuffer.destroy(),this._depthClearState=null}}_prefilteredEnvironment(e){if(!(e instanceof rt)||e.source.destroyed)return t.source;let n=this._iblEnvironmentMap.get(e.source);return n||(n=Ce({renderer:this.renderer,sourceTexture:e}),this._iblEnvironmentMap.set(e.source,n),e.source.once(`destroy`,this._onEnvironmentDestroy)),n.source}prepareView(e){let{view3d:t,lights:n}=e;this.renderer.lighting3d.update(t,n),this._updateGlobalUniforms(t)}_updateGlobalUniforms(e){let{fog:t}=e,n=R(e,this.renderer),r=n.globalUniformGroup.uniforms;if(r.uTime=performance.now()/1e3,r.uExposure=e.exposure,r.uDisplayExposure=e.exposure**(1/2.2),t){yn.setValue(t.color??13421772),et(r.uFogColor,0,yn,e.exposure);let n=r.uFogParams;n[0]=t.near||0,n[1]=t.far||99999999,n[2]=t.density||0}n.globalUniformGroup.update()}};st.add(lt,mn,bn);export{rn as GL_STATE_KEY_RANGE,lt as LightingSystemGl,mn as MaterialSystemGl,nn as Mesh3DBatcherGl,vn as ShadowRenderPassGl,bn as View3DPipeGl,U as WGSL_TO_GLSL_BINDING_TYPE,H as WGSL_TO_GLSL_TYPE,X as compileGlslSource,$ as createTexturesPluginGl,Y as generateGlslStructAccessor,R as getGlobalGlData,L as globalBitGl,yt as glslAttributesPlugin,Ot as glslBindingsPlugin,jt as glslFragmentOutputsPlugin,Mt as glslGroupMapPlugin,Nt as glslHeadersPlugin,zt as glslInterStagePlugin,Bt as glslOverridesPlugin,Vt as glslPrecisionPlugin,Gt as glslStageSlotsPlugin,Jt as instanceAccessPluginGl,G as mat2ColumnMember,Zt as materialTextureAccessPluginGl,$t as materialUniformAccessPluginGl,dt as morphTargetBitGl,ft as morphTargetNormalBitGl,Q as packGlBatchKey,hn as renderForwardBatchesGl,mt as shadowBitsGl,gn as shadowGlobalBitGl,V as skinningBitGl,W as uniformBlockInstanceName};
//# sourceMappingURL=pixijs-3d-webgl.min.mjs.map