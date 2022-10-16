import { mergeResolvers } from '@graphql-tools/merge';

import { authResolvers } from './auth';

export const resolvers = mergeResolvers([authResolvers]);
