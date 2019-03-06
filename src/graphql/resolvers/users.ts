import { userModel as User } from '../../models'
import { ApiError } from '../../config/error'

export default {
  signUp: async (_, { username, password }) => {
    if (await User.findOne({ username })) {
      throw new ApiError('CLIENT', { message: `Username '${username}' is already taken` })
    }

    const newUser = await new User({
      username,
      password
    }).save()

    return {
      token: newUser.createToken(newUser._id)
    }
  },

  signIn: async (_, { username, password }) => {
    const user = await User.findOne({ username })

    if (!user) {
      throw new ApiError('CLIENT', {
        message: 'There is no user with that username'
      })
    } else if (!(await user.isPasswordValid(password))) {
      throw new ApiError('CLIENT', {
        message: 'Incorrect username or password'
      })
    } else {
      return { token: user.createToken(user._id) }
    }
  },

  getAllUsers: async () => {
    const allUsers = await User.find()

    if (!allUsers) {
      throw new Error('There are no users')
    } else {
      return allUsers
    }
  },

  getUser: async (_, { id, username }) => {
    const user = await User.findOne({ id, username })

    if (!user) {
      throw new Error('There is no user with that username')
    } else {
      return user
    }
  },

  updateUser: async (_, { id, ...args }) => {
    try {
      return await User.findByIdAndUpdate(id, { $set: args }, { new: true })
    } catch (err) {
      throw new Error(err)
    }
  },

  deleteUser: async (_, { id }) => {
    try {
      return await User.findByIdAndRemove(id)
    } catch (err) {
      throw new Error(err)
    }
  }
}
