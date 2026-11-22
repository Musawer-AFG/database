import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESS_LOGO_MAX_FILE_BYTES, validateBusinessLogoFile, safeBusinessLogo } from '../src/utils/businessLogo.js';

test('logo uploader accepts only normal small photo types',()=>{
  for(const type of ['image/png','image/jpeg','image/webp'])
    assert.equal(validateBusinessLogoFile({type,size:1300}), '');
  assert.match(validateBusinessLogoFile({type:'image/svg+xml',size:500}),/JPG/);
  assert.match(validateBusinessLogoFile({type:'image/gif',size:500}),/JPG/);
  assert.match(validateBusinessLogoFile({type:'image/png',size:BUSINESS_LOGO_MAX_FILE_BYTES+1}),/۵/);
});

test('only valid image data URLs can appear in the sidebar',()=>{
  const minimal='data:image/png;base64,iVBORw0KGgo=';
  assert.equal(safeBusinessLogo(minimal),minimal);
  assert.equal(safeBusinessLogo('https://example.com/image.png'),'');
  assert.equal(safeBusinessLogo('data:image/svg+xml;base64,PHN2Zz4='),'');
  assert.equal(safeBusinessLogo('data:image/png;base64,not base64'),'');
});
