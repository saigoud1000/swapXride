import React from 'react';
import renderer from 'react-test-renderer';
import { CONDITIONS } from '@swapxride/shared';

describe('Mobile App', () => {
    it('imports conditions correctly', () => {
        expect(CONDITIONS.length).toBeGreaterThan(0);
    });
});
