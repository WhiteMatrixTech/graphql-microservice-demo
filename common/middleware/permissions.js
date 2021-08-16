const { and, or, rule, shield } = require('graphql-shield');

function getPermissions(user) {
  if (user) {
    return user.permissions;
  }
  return [];
}

const isAuthenticated = rule()((parent, args, { user }) => user !== null);

const canReadAnyAccount = rule()((parent, args, { user }) => {
  const userPermissions = getPermissions(user);
  return userPermissions.includes('read:any_account');
});

const canReadOwnAccount = rule()((parent, args, { user }) => {
  const userPermissions = getPermissions(user);
  return userPermissions.includes('read:own_account');
});

const isReadingOwnAccount = rule()((parent, { id }, { user }) => user && user.sub === id);

const permissions = shield({
  Query: {
    user: or(and(canReadOwnAccount, isReadingOwnAccount), canReadAnyAccount),
    viewer: isAuthenticated
  }
});

module.exports = { permissions };
