// import { clerkClient } from '@clerk/express'

// export const protectAdmin = async (req, res, next) => {
//     try {
//         const {userId} = req.auth();

//         const user = await clerkClient.users.getUser(userId);

//         if(user.privateMetadata.role !== 'admin'){
//             return res.json({Success : false , message : 'not Authorized'})
//         }

//         next()
//     } catch (error) {
//         return res.json({Success : false , message : 'not Authorized'});
//     }
// }


import { clerkClient } from '@clerk/express';

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ Success: false, message: 'Not Authorized' });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== 'admin') {
      return res.status(403).json({ Success: false, message: 'Not Authorized' });
    }

    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    return res.status(401).json({ Success: false, message: 'Not Authorized' });
  }
};
