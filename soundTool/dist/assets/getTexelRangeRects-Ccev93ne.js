import{w as I,p as h,q as y,j as p}from"./Geometry-C3efUol-.js";import{S as d}from"./DefaultBatcher-CsflWp1x.js";import{u as U}from"./BatchableSprite-BsI67qCc.js";import{u as x}from"./uniformParsers-Cv6n06r2.js";const b={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},D={...b,vertex:{...b.vertex,header:b.vertex.header.replace("group(1)","group(2)")}},E={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}},O={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},k={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};function C(n,t){for(const e in n.attributes){const s=n.attributes[e],o=t[e];o?(s.format??(s.format=o.format),s.offset??(s.offset=o.offset),s.instance??(s.instance=o.instance)):s.format||I(`Attribute ${e} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}g(n)}function g(n){const{buffers:t,attributes:e}=n,s={},o={};for(const r in t){const a=t[r];s[a.uid]=0,o[a.uid]=0}for(const r in e){const a=e[r];s[a.buffer.uid]+=h(a.format).stride}for(const r in e){const a=e[r];a.stride??(a.stride=s[a.buffer.uid]),a.start??(a.start=o[a.buffer.uid]),o[a.buffer.uid]+=h(a.format).stride}}const v=[];v[d.NONE]=void 0;v[d.DISABLED]={stencilWriteMask:0,stencilReadMask:0};v[d.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};v[d.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};v[d.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};v[d.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}};class A{constructor(t){this._syncFunctionHash=Object.create(null),this._adaptor=t,this._systemCheck()}_systemCheck(){if(!U())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(t){const e=this.getUniformGroupData(t);t.buffer||(t.buffer=new y({data:new Float32Array(e.layout.size/4),usage:p.UNIFORM|p.COPY_DST}))}getUniformGroupData(t){return this._syncFunctionHash[t._signature]||this._initUniformGroup(t)}_initUniformGroup(t){const e=t._signature;let s=this._syncFunctionHash[e];if(!s){const o=Object.keys(t.uniformStructures).map(f=>t.uniformStructures[f]),r=this._adaptor.createUboElements(o),a=this._generateUboSync(r.uboElements);s=this._syncFunctionHash[e]={layout:r,syncFunction:a}}return this._syncFunctionHash[e]}_generateUboSync(t){return this._adaptor.generateUboSync(t)}syncUniformGroup(t,e,s){const o=this.getUniformGroupData(t);t.buffer||(t.buffer=new y({data:new Float32Array(o.layout.size/4),usage:p.UNIFORM|p.COPY_DST}));let r=null;return e||(e=t.buffer.data,r=t.buffer.dataInt32),s||(s=0),o.syncFunction(t.uniforms,e,r,s),!0}updateUniformGroup(t){if(t.isStatic&&!t._dirtyId)return!1;t._dirtyId=0;const e=this.syncUniformGroup(t);return t.buffer.update(),e}destroy(){this._syncFunctionHash=null}}function B(n,t,e){const s=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `];let o=0;for(let a=0;a<n.length;a++){const f=n[a],c=f.data.name;let u=!1,i=0;for(let l=0;l<x.length;l++)if(x[l].test(f.data)){i=f.offset/4,s.push(`name = "${c}";`,`offset += ${i-o};`,x[l].ubo),u=!0;break}if(!u)if(f.data.size>1)i=f.offset/4,s.push(e(f,i-o));else{const l=t[f.data.type];i=f.offset/4,s.push(`
                    v = uv.${c};
                    offset += ${i-o};
                    ${l};
                `)}o=i}const r=s.join(`
`);return new Function("uv","data","dataInt32","offset",r)}function m(n,t){return`
        for (let i = 0; i < ${n*t}; i++) {
            data[offset + (((i / ${n})|0) * 4) + (i % ${n})] = v[i];
        }
    `}const S={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,u32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"vec2<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":m(3,2),"mat4x2<f32>":m(4,2),"mat2x3<f32>":m(2,3),"mat4x3<f32>":m(4,3),"mat2x4<f32>":m(2,4),"mat3x4<f32>":m(3,4)},P={...S,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `};function N(n,t,e,s,o){if(n=Math.max(0,n),t=Math.min(t,e*s),n>=t)return 0;const r=Math.floor(n/e),a=n-r*e,f=Math.floor(t/e),c=t-f*e;if(r===f)return o[0].set(a,r,c-a,1),1;let u=0,i=r;return a>0&&(o[u++].set(a,r,e-a,1),i++),f>i&&o[u++].set(0,i,e,f-i),c>0&&o[u++].set(0,f,c,1),u}export{v as G,A as U,b as a,S as b,B as c,E as d,C as e,k as f,N as g,D as l,O as t,P as u};
