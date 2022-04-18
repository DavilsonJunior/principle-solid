import { User } from "../../entities/User";
import { IMailProvider } from "../../providers/IMailProvider";
import { IUserRepository } from "../../repositories/IUserRepository";
import { ICreateUserRequestDTO } from "./CreateUserDTO";

export class CreateUserUseCase { // Single responsability, nesse caso so se preocupa em salvar o usuario, não quer saber oq tem por traz
  constructor(
    private usersRepository: IUserRepository, 
    private mailProvider: IMailProvider
    ) {} // Liscov, recebe a interface e nao se importa se sera postgreSQL, MySQL rtc, tendo o metodo que ele chama esta perfeito

  async execute(data: ICreateUserRequestDTO) {
    const userAlreadyExists = await this.usersRepository.findByEmail(data.email) //dependy iversion, so chma o metodo findByEmail, e ele cuidara que se conectar ao banco

    if (userAlreadyExists) {
      throw new Error('User already exists.');
    }

    const user = new User(data);

    await this.usersRepository.save(user);

    await this.mailProvider.sendMail({
      to: {
        name: data.name,
        email: data.email
      },
      from: {
        name: 'Equipe do Meu App',
        email: 'equipe@meuapp.com'
      },
      subject: 'Seja bem-vindo à plataforma',
      body: '<p>Você já pode fazer login em nossa plataforma.'
    })
  }
}